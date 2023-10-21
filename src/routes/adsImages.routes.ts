import {Router} from "express";
import multer from "multer";

import {AdImagesController} from "../controllers/AdImagesController";
import {verifyAuthentication} from "../middlewares/verifyAuthentication";

import {MULTER} from "../configs/uploadConfig";

export const adImagesRoutes = Router();

const adImagesController = new AdImagesController();

const upload = multer(MULTER);

adImagesRoutes.use(verifyAuthentication);

adImagesRoutes.post("/", upload.array("images"), adImagesController.create);
adImagesRoutes.delete("/", adImagesController.delete);