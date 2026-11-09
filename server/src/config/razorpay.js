import Razorpay from "razorpay";
import crypto from "node:crypto";
import { config } from "./config.js";

if (!config.razorpay.keyId || !config.razorpay.keySecret) {
  throw new Error("Razorpay credentials are not configured");
}

export const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const expected = crypto
    .createHmac("sha256", config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  const received = Buffer.from(signature || "", "hex");

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(expected, received)
  );
};
