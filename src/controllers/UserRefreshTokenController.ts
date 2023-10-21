import dayjs from "dayjs";
import { Request, Response } from "express";

import { AppException } from "../common/AppException";
import { TokenGenerator } from "../services/TokenGenerator";
import { prisma } from "../db";

export class UserRefreshTokenController {
  async create(request: Request, response: Response) {
    const { refresh_token } = request.body;

    if (!refresh_token) {
      throw new AppException("Can't fetch refresh token.");
    }

    const refreshToken = await prisma.refreshTokens.findFirst({
      where: {
        id: refresh_token
      }
    })

    if (!refreshToken) {
      throw new AppException("Refresh token not found for this user.", 404);
    }

    const tokenGenerator = new TokenGenerator();
    const token = await tokenGenerator.execute(refreshToken.user_id);

    const refreshTokenExpired = dayjs().isAfter(dayjs.unix(refreshToken.expires_in));

    if (refreshTokenExpired) {
      throw new AppException("Refresh token has expired.", 401);
    }

    return response.json({ token });
  }
}