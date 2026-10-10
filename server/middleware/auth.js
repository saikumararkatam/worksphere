import jwt from "jsonwebtoken";
import User from "../models/User.js";

const secret = process.env.JWT_SECRET || "development-only-change-this-secret";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured in production.");
}

export async function authenticate(request, response, next) {
  try {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token)
      return response.status(401).json({ message: "Sign in to continue." });
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub).select("-password").lean();
    if (!user)
      return response
        .status(401)
        .json({ message: "This account is no longer available." });
    request.user = user;
    next();
  } catch {
    response
      .status(401)
      .json({ message: "Your session expired. Please sign in again." });
  }
}

export function createToken(user) {
  return jwt.sign({ sub: user._id }, secret, { expiresIn: "14d" });
}

export function requireRole(role) {
  return (request, response, next) => {
    if (request.user.role !== role)
      return response
        .status(403)
        .json({ message: `This action is for ${role}s only.` });
    next();
  };
}
