import { Router } from "express";
import { loginController, SignUpController } from "../controllers/auth";

const router = Router();

router.route("/signup").post(SignUpController);
router.route("/login").post(loginController);

export default router;
