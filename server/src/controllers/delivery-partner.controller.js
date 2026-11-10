import {
  createDeliveryPartner,
  getDeliveryPartners,
} from "../services/delivery-partner.service.js";

export const createPartner = async (req, res, next) => {
  try {
    const partner = await createDeliveryPartner(req.body);

    res.status(201).json({
      success: true,
      message: "Delivery partner created successfully",
      partner,
    });
  } catch (error) {
    next(error);
  }
};

export const listPartners = async (req, res, next) => {
  try {
    const partners = await getDeliveryPartners();

    res.status(200).json({
      success: true,
      partners,
    });
  } catch (error) {
    next(error);
  }
};
