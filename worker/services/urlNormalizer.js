function normalizeUrl(url) {
  try {
    const normalizedUrl = new URL(url);

    normalizedUrl.hash = "";

    normalizedUrl.hostname = normalizedUrl.hostname.toLowerCase();

    if (
      (normalizedUrl.protocol === "http:" && normalizedUrl.port === "80") ||
      (normalizedUrl.protocol === "https:" && normalizedUrl.port === "443")
    ) {
      normalizedUrl.port = "";
    }

    if (normalizedUrl.pathname.length > 1) {
      normalizedUrl.pathname = normalizedUrl.pathname.replace(/\/+$/, "");
    }

    return normalizedUrl.href;
  } catch (error) {
    return null;
  }
}

module.exports = {
  normalizeUrl,
};
