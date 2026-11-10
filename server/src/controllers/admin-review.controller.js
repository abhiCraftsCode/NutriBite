import {
  getAdminReviews,
  moderateReview,
} from "../services/admin-review.service.js";

export const listAdminReviews = async (req, res, next) => {
  try {
    const result = await getAdminReviews(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const changeReviewStatus = async (req, res, next) => {
  try {
    const review = await moderateReview(
      req.params.id,
      req.user.id,
      req.body.status,
    );

    res.status(200).json({
      success: true,
      message: "Review moderated successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};
