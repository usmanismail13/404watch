const { normalizeUrl } = require("./urlNormalizer");

function createCrawler(startUrl) {
  const visitedUrls = new Set();

  const normalizedStartUrl = normalizeUrl(startUrl);

  if (!normalizedStartUrl) {
    throw new Error("Invalid start URL");
  }

  function hasVisited(url) {
    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      return false;
    }

    return visitedUrls.has(normalizedUrl);
  }

  function markAsVisited(url) {
    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      return false;
    }

    if (visitedUrls.has(normalizedUrl)) {
      return false;
    }

    visitedUrls.add(normalizedUrl);

    return true;
  }

  function getVisitedUrls() {
    return Array.from(visitedUrls);
  }

  markAsVisited(normalizedStartUrl);

  return {
    hasVisited,
    markAsVisited,
    getVisitedUrls,
  };
}

module.exports = {
  createCrawler,
};
