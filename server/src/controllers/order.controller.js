import * as orderService from "../services/order.service.js";
import parseId from "../utils/parseId.js";

export const createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body.addressId);

  res.status(201).json({
    message: "Order created. Complete payment to confirm it.",
    order,
  });
};

export const getMyOrders = async (req, res) => {
  const orders = await orderService.getCustomerOrders(req.user.id);
  res.json(orders);
};

export const getMyOrderById = async (req, res) => {
  const order = await orderService.getCustomerOrderById(
    req.user.id,
    parseId(req.params.id),
  );

  res.json(order);
};
