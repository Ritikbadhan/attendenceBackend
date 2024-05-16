import { Router } from "express";
import {logInUser, logOutUser, regesterUser} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(regesterUser)

router.route("/login").post(logInUser)

//secure route

router.route("/logout").post(verifyJWT, logOutUser)

export default router;
