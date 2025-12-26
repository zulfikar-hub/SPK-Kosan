import cookie from "cookie";
import { verifyToken } from "./auth";
import prisma from "./prisma";

export async function getUserFromRequest(req: any) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.topsis_token;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
}
