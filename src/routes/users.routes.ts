import { Router } from "express";
import multer from "multer";

import { MULTER } from "../configs/uploadConfig";
import { verifyAuthentication } from "../middlewares/verifyAuthentication";

import { UsersController } from "../controllers/UsersController";
import { UserProfilePictureController } from "../controllers/UserProfilePictureController";
import { UserAdsController } from "../controllers/UserAdsController";

export const usersRoutes = Router();

const usersController = new UsersController();
const userProfilePictureController = new UserProfilePictureController();
const userAdsController = new UserAdsController();

const upload = multer(MULTER);

usersRoutes.post("/", upload.single("profile_picture"), usersController.create, userProfilePictureController.create);
usersRoutes.get("/me", verifyAuthentication, usersController.show);
usersRoutes.get('/profile/:id', verifyAuthentication, usersController.getUser);
usersRoutes.get("/ads", verifyAuthentication, userAdsController.index);
usersRoutes.put("/update/:id", verifyAuthentication, upload.single("profile_picture"), usersController.update);
usersRoutes.get("/emailValidation", usersController.validate);
usersRoutes.put("/update-password", usersController.updatePassword);
