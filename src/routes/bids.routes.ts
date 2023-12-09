import {Router} from "express";
import {verifyAuthentication} from "../middlewares/verifyAuthentication";
import {BidsController} from "../controllers/BidsController";

export const bidsRouter = Router();

const bidsController = new BidsController();

bidsRouter.use(verifyAuthentication);

bidsRouter.post("/", bidsController.create);
bidsRouter.get("/", bidsController.userBids);
