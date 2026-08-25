const cheerio = require("cheerio");

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
