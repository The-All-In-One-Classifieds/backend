import {Router} from "express";
import {verifyAuthentication} from "../middlewares/verifyAuthentication";
import {ChatsController} from "../controllers/ChatsController";

export const chatsRouter = Router();

const chatsController = new ChatsController();

chatsRouter.use(verifyAuthentication);

chatsRouter.get('/', chatsController.getAllUserChats)
