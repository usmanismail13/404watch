const { extractLinks } = require("./services/linkExtractor");

const html = `
  <a href="/page1">Page 1</a>
  <a href="/page2">Page 2</a>
`;

const links = extractLinks(
  html,
  "https://example.com/"
);

console.log(links);
