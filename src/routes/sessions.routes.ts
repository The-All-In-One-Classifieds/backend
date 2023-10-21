import { Router } from "express";

import { SessionsController } from "../controllers/SessionsController";
import { UserRefreshTokenController } from "../controllers/UserRefreshTokenController";

const sessionsController = new SessionsController();
const userRefreshToken = new UserRefreshTokenController();

export const sessionsRoutes = Router();

sessionsRoutes.post("/", sessionsController.create);
sessionsRoutes.post("/refresh-token", userRefreshToken.create);