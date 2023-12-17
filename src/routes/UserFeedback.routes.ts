import {Router} from "express";
import {verifyAuthentication} from "../middlewares/verifyAuthentication";
import {BidsController} from "../controllers/BidsController";
import {UserFeedbackController} from "../controllers/UserFeedbackController";

export const userFeedbackRouter = Router();

const userFeedbackController = new UserFeedbackController();

userFeedbackRouter.use(verifyAuthentication);

userFeedbackRouter.post("/", userFeedbackController.create);
userFeedbackRouter.get("/:id", userFeedbackController.show);