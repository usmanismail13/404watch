require("dotenv").config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function send404Alert({
  to,
  brokenUrl,
  sourcePage,
  detectedAt,
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: "404Watch detected a broken link",
    text: `
404Watch detected a broken link

Broken URL:
${brokenUrl}

Source page:
${sourcePage}

Detected:
${detectedAt}

This alert was sent by 404Watch.
`,
  });

  if (error) {
    throw new Error(
      `Failed to send 404 alert: ${error.message}`
    );
  }

  return data;
}

async function sendRecoveryAlert({
  to,
  brokenUrl,
  sourcePage,
  recoveredAt,
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: "404Watch: Broken link recovered",
    text: `
Good news! A broken link has recovered.

Broken URL:
${brokenUrl}

Source page:
${sourcePage}

Recovered:
${recoveredAt}

This alert was sent by 404Watch.
`,
  });

  if (error) {
    throw new Error(
      `Failed to send recovery alert: ${error.message}`
    );
  }

  return data;
}

async function sendSupportTicketNotification({
  ticketId,
  customerEmail,
  subject,
  message,
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  if (!process.env.TEST_EMAIL_TO) {
    throw new Error("TEST_EMAIL_TO is not configured");
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: process.env.TEST_EMAIL_TO,
    subject: `New 404Watch support ticket #${ticketId}`,
    text: `
New 404Watch support ticket

Ticket ID:
#${ticketId}

Customer email:
${customerEmail}

Subject:
${subject}

Message:
${message}

This notification was sent by 404Watch.
`,
  });

  if (error) {
    throw new Error(
      `Failed to send support ticket notification: ${error.message}`
    );
  }

  return data;
}

async function sendSupportTicketConfirmation({
  ticketId,
  customerEmail,
  subject,
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: customerEmail,
    subject: `404Watch received your support ticket #${ticketId}`,
    text: `
Hello,

We've received your support request.

Ticket ID:
#${ticketId}

Subject:
${subject}

Our team will review your request and get back to you as soon as possible.

Thank you for contacting 404Watch.

This confirmation was sent by 404Watch.
`,
  });

  if (error) {
    throw new Error(
      `Failed to send support ticket confirmation: ${error.message}`
    );
  }

  return data;
}

module.exports = {
  send404Alert,
  sendRecoveryAlert,
  sendSupportTicketNotification,
  sendSupportTicketConfirmation,
};
