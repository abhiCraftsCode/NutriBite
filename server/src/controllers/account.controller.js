import { updateProfile, changePassword } from "../services/account.service.js";

export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await updateProfile(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const changeMyPassword = async (req, res, next) => {
  try {
    const result = await changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
