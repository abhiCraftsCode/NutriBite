import * as cartService from "../services/cart.service.js";
import parseId from "../utils/parseId.js";

export const getCart = async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.json(cart);
};

export const addCartItem = async (req, res) => {
  const { foodId, quantity } = req.body;

  const cart = await cartService.addCartItem(req.user.id, foodId, quantity);

  res.status(200).json(cart);
};

export const updateCartItem = async (req, res) => {
  const cart = await cartService.updateCartItem(
    req.user.id,
    parseId(req.params.id),
    req.body.quantity,
  );

  res.json(cart);
};

export const removeCartItem = async (req, res) => {
  const cart = await cartService.removeCartItem(
    req.user.id,
    parseId(req.params.id),
  );

  res.json(cart);
};

export const clearCart = async (req, res) => {
  const result = await cartService.clearCart(req.user.id);
  res.json(result);
};
