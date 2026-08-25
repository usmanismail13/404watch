const cheerio = require("cheerio");

const { isSameDomain } = require("../utils/isSameDomain");

function isSupportedUrl(url) {
  try {
    const parsedUrl = new URL(url);

    return (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:"
    );
  } catch (error) {
    return false;
  }
}

function extractLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = [];

  let allowedHostname;

  try {
    allowedHostname = new URL(baseUrl).hostname;
  } catch (error) {
    return links;
  }

  $("a[href]").each((index, element) => {
    const href = $(element).attr("href");

    if (!href) {
      return;
    }

    try {
      const absoluteUrl = new URL(href, baseUrl).href;

      if (!isSupportedUrl(absoluteUrl)) {
        return;
      }

      if (!isSameDomain(absoluteUrl, allowedHostname)) {
        return;
      }

      links.push(absoluteUrl);
    } catch (error) {
      // Ignore invalid URLs
    }
  });

  return links;
}

module.exports = {
  extractLinks,
};
