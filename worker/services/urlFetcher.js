const axios = require("axios");

async function fetchUrl(url) {
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
}

module.exports = {
  fetchUrl,
};
