import {Router} from "express";
import {VerificationController} from "../controllers/VerificationController";

export const verificationRoutes = Router();

const verificationController = new VerificationController();

verificationRoutes.post('/', verificationController.create)
verificationRoutes.post('/authenticate', verificationController.verify)
