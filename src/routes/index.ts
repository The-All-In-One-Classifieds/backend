import { Router } from "express";

import { usersRoutes } from "./users.routes";
import { sessionsRoutes } from "./sessions.routes";
import { adsRoutes } from "./ads.routes";
import { adImagesRoutes } from "./adsImages.routes";
import {categoriesRouter} from "./categories.routes";
import {bidsRouter} from "./bids.routes";
import {feedbackRouter} from "./feedback.routes";

export const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);

routes.use("/ads/images", adImagesRoutes);
routes.use("/ads", adsRoutes);

routes.use("/categories", categoriesRouter);

routes.use("/bids", bidsRouter);
routes.use("/app-feedback", feedbackRouter);
