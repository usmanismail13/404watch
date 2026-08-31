const { normalizeUrl } = require("./urlNormalizer");
const { fetchUrl } = require("./urlFetcher");
const {
  isSafeUrl,
  isSafeUrlResolved,
} = require("./urlSafety");

const MAX_CONCURRENT_REQUESTS =
  Number(process.env.CRAWLER_CONCURRENCY) || 5;
const MAX_CRAWL_URLS =
  Number(process.env.MAX_CRAWL_URLS) || 1000;


function createCrawler(startUrl, websiteId, prisma) {
  const visitedUrls = new Set();
  const crawlerQueue = [];

  let activeRequests = 0;
  const waitingRequests = [];

  const normalizedStartUrl = normalizeUrl(startUrl);

  if (!normalizedStartUrl) {
    throw new Error("Invalid start URL");
  }

  if (!isSafeUrl(normalizedStartUrl)) {
    throw new Error(
      `Blocked unsafe/private start URL: ${normalizedStartUrl}`
    );
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
if (visitedUrls.size + crawlerQueue.length >= MAX_CRAWL_URLS) {
  console.log(
    `Crawler URL limit reached (${MAX_CRAWL_URLS}). Skipping: ${normalizedUrl}`
  );

  return false;
}


    if (!normalizedUrl) {
      return false;
    }

    if (!isSafeUrl(normalizedUrl)) {
      console.log(
        `Blocked unsafe/private URL: ${normalizedUrl}`
      );

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

  function acquireRequestSlot() {
    if (activeRequests < MAX_CONCURRENT_REQUESTS) {
      activeRequests++;

      return Promise.resolve();
    }

    return new Promise((resolve) => {
      waitingRequests.push(resolve);
    }).then(() => {
      activeRequests++;
    });
  }

  function releaseRequestSlot() {
    activeRequests--;

    if (activeRequests < 0) {
      activeRequests = 0;
    }

    const nextRequest = waitingRequests.shift();

    if (nextRequest) {
      nextRequest();
    }
  }

  async function requestUrl(url) {
    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      throw new Error("Invalid URL");
    }

    if (!isSafeUrl(normalizedUrl)) {
      throw new Error(
        `Blocked unsafe/private URL: ${normalizedUrl}`
      );
    }

    const resolvedSafe =
      await isSafeUrlResolved(normalizedUrl);

    if (!resolvedSafe) {
      throw new Error(
        `Blocked URL resolving to a private/internal address: ${normalizedUrl}`
      );
    }

    if (!markAsVisited(normalizedUrl)) {
      return null;
    }

    await acquireRequestSlot();

    try {
      return await fetchUrl(normalizedUrl);
    } finally {
      releaseRequestSlot();
    }
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
    if (
      !response ||
      typeof response.statusCode !== "number"
    ) {
      return false;
    }

    return response.statusCode === 404;
  }

  function isSuccessfulResponse(response) {
    if (
      !response ||
      typeof response.statusCode !== "number"
    ) {
      return false;
    }

    return (
      response.statusCode >= 200 &&
      response.statusCode < 300
    );
  }

  async function checkUrlForSuccess(url) {
    const result = await requestUrl(url);

    if (!result) {
      return null;
    }

    return {
      url: result.url,
      statusCode: result.statusCode,
      html: result.html,
      successful: isSuccessfulResponse(result),
    };
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
        status: "404",
      },
    });
  }

  async function detectRecoveredUrl(url) {
    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      return null;
    }

    const existing404 =
      await findActive404(normalizedUrl);

    if (!existing404) {
      return null;
    }

    const recovered404 =
      await prisma.error404.update({
        where: {
          id: existing404.id,
        },
        data: {
          status: "recovered",
          recoveredAt: new Date(),
        },
      });

    return {
      errorId: recovered404.id,
      url: recovered404.url,
      websiteId: recovered404.websiteId,
      status: recovered404.status,
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
      existing404 =
        await findActive404(result.url);

      if (existing404) {
        recovery =
          await detectRecoveredUrl(result.url);
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

  function getActiveRequestCount() {
    return activeRequests;
  }

  function getWaitingRequestCount() {
    return waitingRequests.length;
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
    checkUrlForSuccess,
    findActive404,
    detectRecoveredUrl,
    checkUrlFor404,
    getVisitedUrls,
    getActiveRequestCount,
    getWaitingRequestCount,
  };
}

module.exports = {
  createCrawler,
};
