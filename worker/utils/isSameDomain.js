function isSameDomain(url, allowedHostname) {
  try {
    const parsedUrl = new URL(url);

    return parsedUrl.hostname === allowedHostname;
  } catch (error) {
    return false;
  }
}

module.exports = {
  isSameDomain,
};
