import { getAdminDashboard } from "../services/dashboard.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await getAdminDashboard();

    res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    next(error);
  }
};
