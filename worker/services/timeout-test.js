const http = require("http");

const server = http.createServer((req, res) => {
  console.log("Request received. Waiting 15 seconds...");

  setTimeout(() => {
    res.writeHead(200, {
      "Content-Type": "text/plain",
    });

    res.end("Finished");
  }, 15000);
});

server.listen(3001, async () => {
  console.log("Test server running on http://localhost:3001");

  const { fetchUrl } = require("./urlFetcher");


  const start = Date.now();

  try {
    await fetchUrl("http://localhost:3001");

    console.log("Finished");
  } catch (error) {
    console.log(
      "Error:",
      error.code,
      "Time:",
      Date.now() - start,
      "ms"
    );
  } finally {
    server.close();
  }
});
