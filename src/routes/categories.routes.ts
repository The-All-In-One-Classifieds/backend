import {Router} from "express";
import {verifyAuthentication} from "../middlewares/verifyAuthentication";
import {CategoriesController} from "../controllers/CategoriesController";

export const categoriesRouter = Router();

const categoriesController = new CategoriesController();

categoriesRouter.use(verifyAuthentication);

categoriesRouter.get("/", categoriesController.index);
categoriesRouter.get("/root", categoriesController.root);
categoriesRouter.get("/:id/childs", categoriesController.childs);