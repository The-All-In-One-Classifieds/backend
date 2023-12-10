import {Router} from "express";
import {verifyAuthentication} from "../middlewares/verifyAuthentication";
import {BidsController} from "../controllers/BidsController";
import {FeedbackController} from "../controllers/FeedbackController";

export const feedbackRouter = Router();

const feedbackController = new FeedbackController();

feedbackRouter.use(verifyAuthentication);

feedbackRouter.post("/", feedbackController.create);
feedbackRouter.get("/", feedbackController.show);