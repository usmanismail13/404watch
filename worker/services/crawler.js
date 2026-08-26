const { normalizeUrl } = require("./urlNormalizer");

function createCrawler(startUrl) {
  const visitedUrls = new Set();
  const crawlerQueue = [];

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

  function enqueueUrl(url) {
    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      return false;
    }

    if (hasVisited(normalizedUrl)) {
      return false;
    }

    if (crawlerQueue.includes(normalizedUrl)) {
      return false;
    }

    crawlerQueue.push(normalizedUrl);

    return true;
  }

  function dequeueUrl() {
    return crawlerQueue.shift() || null;
  }

  function isQueueEmpty() {
    return crawlerQueue.length === 0;
  }

  function getQueueSize() {
    return crawlerQueue.length;
  }

  function getQueuedUrls() {
    return [...crawlerQueue];
  }

  function getVisitedUrls() {
    return Array.from(visitedUrls);
  }

  markAsVisited(normalizedStartUrl);

  return {
    hasVisited,
    markAsVisited,
    enqueueUrl,
    dequeueUrl,
    isQueueEmpty,
    getQueueSize,
    getQueuedUrls,
    getVisitedUrls,
  };
}

module.exports = {
  createCrawler,
};
