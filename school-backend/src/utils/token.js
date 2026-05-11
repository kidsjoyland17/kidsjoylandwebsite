import jwt from "jsonwebtoken";

const IS_PROD = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? "none" : "lax",  // "none" needs secure:true (prod only)
  maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 days
};

export const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

/** Set an HTTP-only cookie on the response */
export const setTokenCookie = (res, token) => {
  res.cookie("token", token, COOKIE_OPTIONS);
};

/** Clear the auth cookie — MUST use same options as set, otherwise browser ignores it */
export const clearTokenCookie = (res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
};