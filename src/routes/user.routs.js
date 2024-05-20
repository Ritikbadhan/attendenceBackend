import { Router } from "express";
import {logInUser, logOutUser, regesterUser,userAttendController} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(regesterUser)

router.route("/login").post(logInUser)

//secure route

router.route("/logout").post(verifyJWT, logOutUser)
router.route("/attendece").post(verifyJWT, userAttendController)

export default router;
