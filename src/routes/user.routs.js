import { Router } from "express";
import {forgotPassword, logInUser, logOutUser, regesterUser,updateProfile,userAttendController} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(regesterUser)
router.route("/forgot-passwword").post(forgotPassword)
router.route("/login").post(logInUser)

//secure route

router.route("/logout").post(verifyJWT, logOutUser)
router.route("/attendece").post(verifyJWT, userAttendController)
router.route("/update-profile").post(verifyJWT, updateProfile)

export default router;
