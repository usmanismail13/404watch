const { normalizeUrl } = require("./urlNormalizer");
const { fetchUrl } = require("./urlFetcher");

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

  async function requestUrl(url) {
    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      throw new Error("Invalid URL");
    }

    if (!markAsVisited(normalizedUrl)) {
      return null;
    }

    return fetchUrl(normalizedUrl);
  }

  async function requestUrlWithStatus(url) {
    const result = await requestUrl(url);

    if (!result) {
      return null;
    }

    return {
      url: result.url,
      statusCode: result.statusCode,
    };
  }

  function isNotFoundResponse(response) {
    if (!response || typeof response.statusCode !== "number") {
      return false;
    }

    return response.statusCode === 404;
  }

  async function checkUrlFor404(url) {
    const result = await requestUrl(url);

    if (!result) {
      return null;
    }

    return {
      url: result.url,
      statusCode: result.statusCode,
      is404: isNotFoundResponse(result),
    };
  }

  function getVisitedUrls() {
    return Array.from(visitedUrls);
  }

  enqueueUrl(normalizedStartUrl);

  return {
    hasVisited,
    markAsVisited,
    enqueueUrl,
    dequeueUrl,
    isQueueEmpty,
    getQueueSize,
    getQueuedUrls,
    requestUrl,
    requestUrlWithStatus,
    isNotFoundResponse,
    checkUrlFor404,
    getVisitedUrls,
  };
}

module.exports = {
  createCrawler,
};
