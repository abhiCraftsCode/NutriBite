import {
  createReview,
  getFoodReviews,
  getMyReviews,
} from "../services/review.service.js";

export const submitReview = async (req, res, next) => {
  try {
    const review = await createReview(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Review submitted for moderation",
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const listFoodReviews = async (req, res, next) => {
  try {
    const result = await getFoodReviews(req.params.foodId, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const listMyReviews = async (req, res, next) => {
  try {
    const reviews = await getMyReviews(req.user.id);

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
