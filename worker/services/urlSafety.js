const dns = require("dns").promises;
const net = require("net");

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);

    const a = parts[0];
    const b = parts[1];

    // 10.0.0.0/8
    if (a === 10) {
      return true;
    }

    // 127.0.0.0/8
    if (a === 127) {
      return true;
    }

    // 169.254.0.0/16
    if (a === 169 && b === 254) {
      return true;
    }

    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) {
      return true;
    }

    // 192.168.0.0/16
    if (a === 192 && b === 168) {
      return true;
    }

    // 0.0.0.0/8
    if (a === 0) {
      return true;
    }

    return false;
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();

    // IPv6 loopback
    if (normalized === "::1") {
      return true;
    }

    // IPv6 unspecified
    if (normalized === "::") {
      return true;
    }

    // IPv4-mapped IPv6 addresses
    if (normalized.startsWith("::ffff:")) {
      const ipv4 = normalized.substring(7);

      if (net.isIPv4(ipv4)) {
        return isPrivateIp(ipv4);
      }
    }

    // fc00::/7 - Unique local addresses
    if (
      normalized.startsWith("fc") ||
      normalized.startsWith("fd")
    ) {
      return true;
    }

    // fe80::/10 - Link-local addresses
    if (
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb")
    ) {
      return true;
    }

    return false;
  }

  return false;
}

function isPrivateHostname(hostname) {
  const normalizedHostname = hostname
    .toLowerCase()
    .replace(/\.$/, "");

  if (
    normalizedHostname === "localhost" ||
    normalizedHostname === "localhost.localdomain"
  ) {
    return true;
  }

  if (normalizedHostname.endsWith(".localhost")) {
    return true;
  }

  if (normalizedHostname.endsWith(".local")) {
    return true;
  }

  if (normalizedHostname.endsWith(".internal")) {
    return true;
  }

  return false;
}

function isSafeUrl(url) {
  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return false;
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    if (isPrivateHostname(hostname)) {
      return false;
    }

    if (net.isIP(hostname)) {
      return !isPrivateIp(hostname);
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function isSafeUrlResolved(url) {
  try {
    const parsedUrl = new URL(url);

    if (!isSafeUrl(url)) {
      return false;
    }

    const hostname = parsedUrl.hostname;

    const addresses = await dns.lookup(hostname, {
      all: true,
      verbatim: true,
    });

    for (const address of addresses) {
      if (isPrivateIp(address.address)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  isPrivateIp,
  isPrivateHostname,
  isSafeUrl,
  isSafeUrlResolved,
};
