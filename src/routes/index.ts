import { Router } from "express";

import { usersRoutes } from "./users.routes";
import { sessionsRoutes } from "./sessions.routes";
import { adsRoutes } from "./ads.routes";
import { adImagesRoutes } from "./adsImages.routes";

export const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);

routes.use("/ads/images", adImagesRoutes);
routes.use("/ads", adsRoutes);