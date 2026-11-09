import * as addressService from "../services/address.service.js";
import parseId from "../utils/parseId.js";

export const getAddresses = async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.id);
  res.json(addresses);
};

export const createAddress = async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);

  res.status(201).json(address);
};

export const updateAddress = async (req, res) => {
  const address = await addressService.updateAddress(
    req.user.id,
    parseId(req.params.id),
    req.body,
  );

  res.json(address);
};

export const deleteAddress = async (req, res) => {
  const result = await addressService.deleteAddress(
    req.user.id,
    parseId(req.params.id),
  );

  res.json(result);
};
