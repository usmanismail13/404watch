const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");

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

router.post("/:websiteId", authMiddleware, async (req, res) => {
  const websiteId = Number(req.params.websiteId);

  if (!Number.isInteger(websiteId)) {
    return res.status(400).json({
      message: "Invalid website ID",
    });
  }

  let scan;

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

    if (!website.monitoringEnabled) {
      return res.status(400).json({
        message: "Monitoring is disabled for this website",
      });
    }

    scan = await prisma.scan.create({
      data: {
        websiteId: website.id,
        status: "running",
      },
    });

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

    const $ = cheerio.load(response.data);

    const links = new Set();

    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");

      if (!href) {
        return;
      }

      const normalizedUrl = normalizeUrl(href, website.url);

      if (normalizedUrl) {
        links.add(normalizedUrl);
      }
    });

    const brokenLinks = [];

    for (const link of links) {
      try {
        const linkResponse = await axios.get(link, {
          timeout: 10000,
          maxRedirects: 5,
          validateStatus: () => true,
          headers: {
            "User-Agent": "404Watch/1.0",
          },
        });

        if (linkResponse.status === 404) {
          brokenLinks.push({
            url: link,
            sourceUrl: website.url,
            status: String(linkResponse.status),
          });
        }
      } catch (error) {
        console.error(`Failed to check ${link}:`, error.message);
      }
    }

    for (const brokenLink of brokenLinks) {
      const existingError = await prisma.error404.findFirst({
        where: {
          websiteId: website.id,
          url: brokenLink.url,
          sourceUrl: brokenLink.sourceUrl,
          status: brokenLink.status,
        },
      });

      if (!existingError) {
        await prisma.error404.create({
          data: {
            websiteId: website.id,
            url: brokenLink.url,
            sourceUrl: brokenLink.sourceUrl,
            status: brokenLink.status,
          },
        });
      }
    }

    const completedScan = await prisma.scan.update({
      where: {
        id: scan.id,
      },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    res.status(200).json({
      message: "Website scan completed",
      scan: completedScan,
      linksChecked: links.size,
      errorsFound: brokenLinks.length,
      errors: brokenLinks,
    });
  } catch (error) {
    console.error("Scan error:", error);

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
        console.error("Failed to update scan status:", updateError);
      }
    }

    res.status(500).json({
      message: "Failed to scan website",
    });
  }
});

module.exports = router;