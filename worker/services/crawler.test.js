const axios = require("axios");

async function runTest() {
  const testUrl =
    "https://example.com/this-page-does-not-exist-404";

  try {
    const response = await axios.get(testUrl, {
      timeout: 10000,
      validateStatus: () => true,
    });

    console.log("🚨 404 Test Result:");
    console.log(`URL: ${testUrl}`);
    console.log(`Status: ${response.status}`);

    if (response.status === 404) {
      console.log("✅ Step 8.5 PASSED — 404 detected!");
    } else {
      console.log(
        `❌ Step 8.5 FAILED — Expected 404, got ${response.status}`
      );
    }
  } catch (error) {
    console.error("❌ Test failed:");
    console.error(error.message);
  }
}

runTest();
