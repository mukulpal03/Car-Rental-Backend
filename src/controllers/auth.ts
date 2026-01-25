import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const SignUpController = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "invalid inputs",
    });
  }

  try {
    const userExist = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (userExist) {
      return res.status(400).json({
        success: false,
        error: "username already exists",
      });
    }

    const hashedPass = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPass,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        message: "User created successfully",
        userId: user.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "something went wrong",
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "invalid inputs",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "user does not exist",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: "incorrect password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET as string,
    );

    return res.status(200).json({
      success: true,
      data: {
        message: "Login successful",
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "something went wrong",
    });
  }
};
