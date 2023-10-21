import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { AppException } from "../common/AppException";
import { authConfig } from "../configs/authConfig";

export async function verifyAuthentication(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppException("Missing JWT token; please provide a valid JWT token to proceed", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const { sub: user_id } = verify(token, authConfig.jwt.secret);

    if (typeof user_id !== 'string') {
      throw new AppException("JWT token verification failed!", 401)
    }

    request.user = {
      id: user_id,
    };

    return next();
  } catch {
    throw new AppException("token.invalid", 401);
  }
}