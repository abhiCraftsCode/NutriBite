import {
  getAdminSuggestions,
  reviewSuggestion,
} from "../services/admin-suggestion.service.js";

export const listAdminSuggestions = async (req, res, next) => {
  try {
    const result = await getAdminSuggestions(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const moderateSuggestion = async (req, res, next) => {
  try {
    const suggestion = await reviewSuggestion(
      req.params.id,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Suggestion reviewed successfully",
      suggestion,
    });
  } catch (error) {
    next(error);
  }
};
