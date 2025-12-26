import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export const TOKEN_NAME = "topsis_token";
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari
const JWT_SECRET = process.env.JWT_SECRET || "secret_key_ganti";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
  } catch {
    return null;
  }
}

export function setTokenCookie(token: string) {
  return cookie.serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
}

export function removeTokenCookie() {
  return cookie.serialize(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
