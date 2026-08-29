const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const { sendRecoveryAlert } = require("../services/emailService");

const router = express.Router();

function normalizeUrl(url, baseUrl) {
  try {
    const absoluteUrl = new URL(url, baseUrl);

    if (!["http:", "https:"].includes(absoluteUrl.protocol)) {
      return null;
    }

    absoluteUrl.hash = "";

    return absoluteUrl.href;
  } catch {
    return null;
  }
}

// =========================================================
// 🔍 Check whether a URL is working
// =========================================================

async function checkUrl(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        "User-Agent": "404Watch/1.0",
      },
    });

    return response.status;
  } catch (error) {
    console.error(`Failed to check ${url}:`, error.message);
    return null;
  }
}

// =========================================================
// POST /api/scans/:websiteId
// =========================================================

router.post("/:websiteId", authMiddleware, async (req, res) => {
  const websiteId = Number(req.params.websiteId);

  if (!Number.isInteger(websiteId)) {
    return res.status(400).json({
      message: "Invalid website ID",
    });
  }

  let scan;

  try {
    // =====================================================
    // 🌐 Find website
    // =====================================================

    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: req.user.userId,
      },
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found",
      });
    }

    // =====================================================
    // ⏸️ Check monitoring
    // =====================================================

    if (!website.monitoringEnabled) {
      return res.status(400).json({
        message: "Monitoring is disabled for this website",
      });
    }

    // =====================================================
    // 📊 Create scan
    // =====================================================

    scan = await prisma.scan.create({
      data: {
        websiteId: website.id,
        status: "running",
      },
    });

    // =====================================================
    // 🏠 Fetch website homepage
    // =====================================================

    const response = await axios.get(website.url, {
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        "User-Agent": "404Watch/1.0",
      },
    });

    if (response.status >= 400) {
      await prisma.scan.update({
        where: {
          id: scan.id,
        },
        data: {
          status: "failed",
          completedAt: new Date(),
        },
      });

      return res.status(502).json({
        message: `Unable to scan website. Website returned HTTP ${response.status}`,
      });
    }

    // =====================================================
    // 🔗 Extract links
    // =====================================================

    const $ = cheerio.load(response.data);

    const links = new Set();

    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");

      if (!href) {
        return;
      }

      const normalizedUrl = normalizeUrl(
        href,
        website.url
      );

      if (normalizedUrl) {
        links.add(normalizedUrl);
      }
    });

    // =====================================================
    // 🔍 Check discovered links
    // =====================================================

    const brokenLinks = [];

    for (const link of links) {
      const statusCode = await checkUrl(link);

      // 🔴 New 404
      if (statusCode === 404) {
        brokenLinks.push({
          url: link,
          sourceUrl: website.url,
          status: "404",
        });
      }
    }

    // =====================================================
    // 🟢 Check previously detected errors
    // =====================================================

    const existingErrors = await prisma.error404.findMany({
      where: {
        websiteId: website.id,
        status: "404",
      },
    });

    for (const existingError of existingErrors) {
      // Don't check the same URL twice
      if (links.has(existingError.url)) {
        continue;
      }

      const statusCode = await checkUrl(
        existingError.url
      );

      // ===================================================
      // 🟢 Broken URL recovered
      // ===================================================

      if (
        statusCode !== null &&
        statusCode >= 200 &&
        statusCode < 400
      ) {
        console.log(
          `🟢 Recovered URL detected: ${existingError.url}`
        );

        const recoveredAt = new Date();

        await prisma.error404.update({
          where: {
            id: existingError.id,
          },
          data: {
            status: "recovered",
            recoveredAt,
          },
        });

        // =================================================
        // 📧 Send recovery email
        // =================================================

        try {
          await sendRecoveryAlert({
            to: req.user.email,
            brokenUrl: existingError.url,
            sourcePage: existingError.sourceUrl,
            recoveredAt,
          });

          console.log(
            `📧 Recovery email sent for: ${existingError.url}`
          );
        } catch (emailError) {
          console.error(
            `❌ Failed to send recovery email for ${existingError.url}:`,
            emailError.message
          );
        }
      }
    }

    // =====================================================
    // 💾 Save new 404 errors
    // =====================================================

    for (const brokenLink of brokenLinks) {
      const existingError =
        await prisma.error404.findFirst({
          where: {
            websiteId: website.id,
            url: brokenLink.url,
          },
        });

      if (!existingError) {
        await prisma.error404.create({
          data: {
            websiteId: website.id,
            url: brokenLink.url,
            sourceUrl: brokenLink.sourceUrl,
            status: "404",
          },
        });

        continue;
      }

      // ===================================================
      // 🔴 Previously recovered URL became broken again
      // ===================================================

      if (existingError.status === "recovered") {
        await prisma.error404.update({
          where: {
            id: existingError.id,
          },
          data: {
            status: "404",
            recoveredAt: null,
            detectedAt: new Date(),
          },
        });
      }
    }

    // =====================================================
    // 🟢 Complete scan
    // =====================================================

    const completedScan = await prisma.scan.update({
      where: {
        id: scan.id,
      },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Website scan completed",
      scan: completedScan,
      linksChecked: links.size,
      errorsFound: brokenLinks.length,
      errors: brokenLinks,
    });
  } catch (error) {
    console.error("❌ Scan error:", error);

    if (scan) {
      try {
        await prisma.scan.update({
          where: {
            id: scan.id,
          },
          data: {
            status: "failed",
            completedAt: new Date(),
          },
        });
      } catch (updateError) {
        console.error(
          "Failed to update scan status:",
          updateError
        );
      }
    }

    return res.status(500).json({
      message: "Failed to scan website",
    });
  }
});

// =========================================================
// GET /api/scans/:websiteId
// =========================================================

router.get("/:websiteId", authMiddleware, async (req, res) => {
  const websiteId = Number(req.params.websiteId);

  if (!Number.isInteger(websiteId)) {
    return res.status(400).json({
      message: "Invalid website ID",
    });
  }

  try {
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: req.user.userId,
      },
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found",
      });
    }

    const scans = await prisma.scan.findMany({
      where: {
        websiteId: website.id,
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return res.status(200).json({
      scans,
    });
  } catch (error) {
    console.error("Get scans error:", error);

    return res.status(500).json({
      message: "Failed to get scans",
    });
  }
});

module.exports = router;
