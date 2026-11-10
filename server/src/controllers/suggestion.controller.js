import {
  createSuggestion,
  getMySuggestions,
  getMySuggestionById,
} from "../services/suggestion.service.js";

export const submitSuggestion = async (req, res, next) => {
  try {
    const suggestion = await createSuggestion(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Suggestion submitted successfully",
      suggestion,
    });
  } catch (error) {
    next(error);
  }
};

export const listMySuggestions = async (req, res, next) => {
  try {
    const suggestions = await getMySuggestions(req.user.id);

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

export const getMySuggestion = async (req, res, next) => {
  try {
    const suggestion = await getMySuggestionById(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      suggestion,
    });
  } catch (error) {
    next(error);
  }
};
