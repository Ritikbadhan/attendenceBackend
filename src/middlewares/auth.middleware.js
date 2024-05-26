import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
    req.cookies?.access_token || // Corrected property name from accessToken to access_token
    req.headers["authorization"]?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }
  
    const deCodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = await Admin.findById(deCodedToken?._id) || User.findById(deCodedToken?._id).select(
      "-password"
    );
  
    if (!user) {
      throw new ApiError(401, "Access token is in valid");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.messgae || "Invalid acces token")
  }
});
