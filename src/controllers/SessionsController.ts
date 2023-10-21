import { compare } from "bcryptjs";
import { Request, Response } from "express";

import { AppException } from "../common/AppException";

import { prisma } from "../db";

import { RefreshTokenGenerator } from "../services/RefreshTokenGenerator";
import { TokenGenerator } from "../services/TokenGenerator";

export class SessionsController {
  async create(request: Request, response: Response) {
    const { email, password } = request.body;

    console.log(email, password)
    const user = await prisma.users.findUnique({
      where: {
        email
      }
    })

    if (!user) {
      throw new AppException("User does not exist", 404);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppException("Incorrect password", 404);
    }

    const tokenProvider = new TokenGenerator();
    const token = await tokenProvider.execute(user.id);

    const refreshTokenProvider = new RefreshTokenGenerator();
    const newRefreshToken = await refreshTokenProvider.execute(user.id);

    const { password: removeField, ...rest } = user;

    response.status(201).json({ token, user: { ...rest }, refresh_token: newRefreshToken.id });
  }
}