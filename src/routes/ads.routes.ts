import { Router } from "express";

import { AdsController } from "../controllers/AdsController";
import { verifyAuthentication } from "../middlewares/verifyAuthentication";

export const adsRoutes = Router();

const adsController = new AdsController();

adsRoutes.use(verifyAuthentication);

adsRoutes.get("/", adsController.index);
adsRoutes.get("/:id", adsController.show);
adsRoutes.post("/", adsController.create);
adsRoutes.put("/:id", adsController.update);
adsRoutes.patch("/:id", adsController.patch);
adsRoutes.delete("/:id", adsController.delete);