import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const checkAdmin = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  const deCodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(deCodedToken?._id);

  if (!user.isAdmin) {
    throw new ApiError(403, "Forbidden: Admins only");
  }
  next();
});
