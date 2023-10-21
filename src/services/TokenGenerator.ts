import {sign} from "jsonwebtoken";
import {authConfig} from "../configs/authConfig";

export class TokenGenerator {
  async execute(userId: number) {
    const { secret, expiresIn } = authConfig.jwt;

    return sign({}, secret, {
      subject: String(userId),
      expiresIn
    });
  }
}