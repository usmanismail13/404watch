const { normalizeUrl } = require("./urlNormalizer");
const { fetchUrl } = require("./urlFetcher");

function createCrawler(startUrl, websiteId, prisma) {
  const visitedUrls = new Set();
  const crawlerQueue = [];

  const normalizedStartUrl = normalizeUrl(startUrl);

  if (!normalizedStartUrl) {
    throw new Error("Invalid start URL");
  }

  if (!websiteId) {
    throw new Error("Website ID is required");
  }

  if (!prisma) {
    throw new Error("Prisma client is required");
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

  function isSuccessfulResponse(response) {
    if (!response || typeof response.statusCode !== "number") {
      return false;
    }

    return response.statusCode >= 200 && response.statusCode < 300;
  }

  async function findActive404(url) {
    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      return null;
    }

    return prisma.error404.findFirst({
      where: {
        websiteId,
        url: normalizedUrl,
        status: "active",
      },
    });
  }

  async function detectRecoveredUrl(url) {
    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      return null;
    }

    const existing404 = await findActive404(normalizedUrl);

    if (!existing404) {
      return null;
    }

    return {
      errorId: existing404.id,
      url: existing404.url,
      websiteId: existing404.websiteId,
      status: existing404.status,
      recovered: true,
    };
  }

  async function checkUrlFor404(url, sourceUrl) {
    const result = await requestUrl(url);

    if (!result) {
      return null;
    }

    const is404 = isNotFoundResponse(result);

    let existing404 = null;
    let recovery = null;

    if (isSuccessfulResponse(result)) {
      existing404 = await findActive404(result.url);

      if (existing404) {
        recovery = {
          errorId: existing404.id,
          url: existing404.url,
          websiteId: existing404.websiteId,
          status: existing404.status,
          recovered: true,
        };
      }
    }

    return {
      brokenUrl: result.url,
      sourceUrl: sourceUrl || null,
      statusCode: result.statusCode,
      html: result.html,
      is404,
      existing404,
      recovery,
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
    isSuccessfulResponse,
    findActive404,
    detectRecoveredUrl,
    checkUrlFor404,
    getVisitedUrls,
  };
}

module.exports = {
  createCrawler,
};
