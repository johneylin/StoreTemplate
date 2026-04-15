import type { PaymentMethod } from "@/generated/prisma/client";

type OrderNotificationDetails = {
  orderId: string;
  paymentMethod: PaymentMethod;
  pickupPhone: string | null;
  pickupEmail: string | null;
  pickupTime: string;
  pickupAddress: string;
  eTransferEmail: string;
};

function getOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function buildOrderMessage(details: OrderNotificationDetails) {
  const lines = [
    `Order ID: ${details.orderId}`,
    `Pickup time: ${details.pickupTime}`,
    `Pickup address: ${details.pickupAddress}`,
  ];

  if (details.paymentMethod === "E_TRANSFER") {
    lines.push(
      `Payment: Please send your e-transfer to ${details.eTransferEmail} and include ${details.orderId} in the message.`,
    );
  } else {
    lines.push("Payment: Please bring cash when you arrive for pickup.");
  }

  return lines.join("\n");
}

async function sendOrderEmail(details: OrderNotificationDetails) {
  const apiKey = getOptionalEnv("RESEND_API_KEY");
  const from = getOptionalEnv("RESEND_FROM_EMAIL");

  if (!apiKey || !from || !details.pickupEmail) {
    return;
  }

  const text = buildOrderMessage(details);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [details.pickupEmail],
      subject: `Order confirmation ${details.orderId}`,
      text,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Resend email failed: ${payload}`);
  }
}

async function sendOrderSms(details: OrderNotificationDetails) {
  const accountSid = getOptionalEnv("TWILIO_ACCOUNT_SID");
  const authToken = getOptionalEnv("TWILIO_AUTH_TOKEN");
  const from = getOptionalEnv("TWILIO_FROM_PHONE");

  if (!accountSid || !authToken || !from || !details.pickupPhone) {
    return;
  }

  const body = new URLSearchParams({
    To: details.pickupPhone,
    From: from,
    Body: buildOrderMessage(details),
  });

  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Twilio SMS failed: ${payload}`);
  }
}

export async function sendOrderNotifications(details: OrderNotificationDetails) {
  const results = await Promise.allSettled([
    sendOrderEmail(details),
    sendOrderSms(details),
  ]);

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(result.reason);
    }
  });
}
