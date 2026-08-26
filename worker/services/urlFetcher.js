const axios = require("axios");

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchUrl(url) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: () => true,
      });

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
