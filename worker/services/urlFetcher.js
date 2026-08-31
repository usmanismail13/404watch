const axios = require("axios");

const {
  isSafeUrlResolved,
} = require("./urlSafety");

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const MAX_REDIRECTS = 5;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchUrl(url, redirectCount = 0) {
  // 🔒 SSRF protection
  const safe = await isSafeUrlResolved(url);

  if (!safe) {
    throw new Error(
      `Blocked unsafe URL: ${url}`
    );
  }

  if (redirectCount > MAX_REDIRECTS) {
    throw new Error(
      `Too many redirects: ${url}`
    );
  }

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        maxRedirects: 0,
        validateStatus: () => true,
      });

      // 🔗 Handle HTTP redirects manually
      if (
        response.status >= 300 &&
        response.status < 400
      ) {
        const location = response.headers.location;

        if (!location) {
          return {
            url,
            statusCode: response.status,
            html: response.data,
            headers: response.headers,
          };
        }

        const redirectUrl = new URL(
          location,
          url
        ).toString();

        // 🔒 Validate redirect destination
        const redirectSafe =
          await isSafeUrlResolved(redirectUrl);

        if (!redirectSafe) {
          throw new Error(
            `Blocked unsafe redirect: ${redirectUrl}`
          );
        }

        return fetchUrl(
          redirectUrl,
          redirectCount + 1
        );
      }

      return {
        url,
        statusCode: response.status,
        html: response.data,
        headers: response.headers,
      };
    } catch (error) {
      lastError = error;

      if (attempt === MAX_RETRIES) {
        throw lastError;
      }

      console.log(
        `Request failed for ${url}. Retrying (${attempt + 1}/${MAX_RETRIES})...`
      );

      await sleep(RETRY_DELAY_MS);
    }
  }

  throw lastError;
}

module.exports = {
  fetchUrl,
};
