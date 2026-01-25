import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      success: false,
      error: "Authorization header missing",
    });
  }

  const token = header.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token missing after Bearer",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: "Token invalid",
    });
  }

  req.user = decoded;
  next();
};
