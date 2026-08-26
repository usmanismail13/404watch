const { createCrawler } = require("./crawler");

async function runTest() {
  const crawler = createCrawler("https://example.com");

  const result = await crawler.checkUrlFor404(
    "https://example.com/missing-page"
  );

  console.log("404 Test Result:");
  console.log(result);
}

runTest().catch((error) => {
  console.error("Test failed:");
  console.error(error);
});
