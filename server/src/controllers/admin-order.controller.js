import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
} from "../services/admin-order.service.js";

export const listOrders = async (req, res, next) => {
  try {
    const result = await getAdminOrders(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const order = await getAdminOrderById(req.params.id);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const changeOrderStatus = async (req, res, next) => {
  try {
    const order = await updateAdminOrderStatus(
      req.params.id,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};
