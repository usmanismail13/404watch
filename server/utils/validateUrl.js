function validateUrl(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    url.pathname = url.pathname.replace(/\/+$/, "") || "/";

    return url.toString();
  } catch {
    return false;
  }
}

module.exports = validateUrl;
