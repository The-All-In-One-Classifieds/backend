import { Router } from "express";

import { usersRoutes } from "./users.routes";
import { sessionsRoutes } from "./sessions.routes";
import { adsRoutes } from "./ads.routes";
import { adImagesRoutes } from "./adsImages.routes";
import {categoriesRouter} from "./categories.routes";
import {bidsRouter} from "./bids.routes";
import {feedbackRouter} from "./feedback.routes";
import {userFeedbackRouter} from "./UserFeedback.routes";
import {verificationRoutes} from "./verification.routes";

export const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);

routes.use("/verify", verificationRoutes)

routes.use("/ads/images", adImagesRoutes);
routes.use("/ads", adsRoutes);

routes.use("/categories", categoriesRouter);

routes.use("/bids", bidsRouter);

routes.use("/app-feedback", feedbackRouter);

routes.use("/review", userFeedbackRouter);
routes.use("/verifyEmail", usersRoutes)

