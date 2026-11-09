import * as paymentService from "../services/payment.service.js";

export const createPaymentOrder = async (req, res) => {
  const result = await paymentService.createPaymentOrder(
    req.user.id,
    req.body.orderId,
  );

  res.status(201).json(result);
};

export const verifyPayment = async (req, res) => {
  const result = await paymentService.verifyPayment(req.user.id, req.body);

  res.json(result);
};

export const markPaymentFailed = async (req, res) => {
  const result = await paymentService.markPaymentFailed(
    req.user.id,
    req.body.razorpayOrderId,
    req.body.failureReason,
  );

  res.json(result);
};
