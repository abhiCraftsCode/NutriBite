import {
  assignDelivery,
  getPartnerDeliveries,
  getPartnerDeliveryById,
  updateDeliveryStatus,
} from "../services/delivery.service.js";

export const assignOrderDelivery = async (req, res, next) => {
  try {
    const delivery = await assignDelivery(
      req.params.orderId,
      req.user.id,
      req.body.partnerId,
    );

    res.status(201).json({
      success: true,
      message: "Delivery assigned successfully",
      delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const listMyDeliveries = async (req, res, next) => {
  try {
    const deliveries = await getPartnerDeliveries(req.user.id);

    res.status(200).json({
      success: true,
      deliveries,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyDelivery = async (req, res, next) => {
  try {
    const delivery = await getPartnerDeliveryById(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const changeDeliveryStatus = async (req, res, next) => {
  try {
    const delivery = await updateDeliveryStatus(
      req.params.id,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      delivery,
    });
  } catch (error) {
    next(error);
  }
};
