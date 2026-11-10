import authenticate from "./auth.middleware.js";

const optionalAuthenticate = (req, res, next) => {
  if (!req.headers.authorization) {
    return next();
  }

  return authenticate(req, res, next);
};

export default optionalAuthenticate;
