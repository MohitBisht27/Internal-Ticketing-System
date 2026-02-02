import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // 1. Get token ONLY from Authorization Header
    // We remove the check for req.cookies.accessToken entirely
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      throw new ApiError(401, "Unauthorized Request: No token provided");
    }

    // 2. Remove "Bearer " prefix (Case insensitive regex is safer)
    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request: Token is missing");
    }

    // 3. Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 4. Find user
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    // Distinguish between expired token vs invalid token for better frontend handling
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "TokenExpired");
    }
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
export const checkRole = (allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access Denied: ${req.user.role} role does not have permission`,
      );
    }
    next();
  });
};
