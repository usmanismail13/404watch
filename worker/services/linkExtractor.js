const cheerio = require("cheerio");

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
