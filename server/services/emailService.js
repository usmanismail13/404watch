const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function send404Alert({
  to,
  brokenUrl,
  sourcePage,
  detectedAt,
}) {
  return resend.emails.send({
    from: "404Watch <alerts@yourdomain.com>",
    to,
    subject: "🚨 404 Error Detected",
    html: `
      <h2>🚨 404 Error Detected</h2>

      <p>A broken URL was detected on your website.</p>

      <p><strong>Broken URL:</strong><br>
      ${brokenUrl}</p>

      <p><strong>Source Page:</strong><br>
      ${sourcePage}</p>

      <p><strong>Detected At:</strong><br>
      ${detectedAt}</p>
    `,
  });
}

module.exports = {
  send404Alert,
};
