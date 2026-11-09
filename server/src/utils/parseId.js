import AppError from "./AppError.js";

const parseId = (value) => {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError("Invalid resource ID", 400);
  }

  return id;
};

export default parseId;
