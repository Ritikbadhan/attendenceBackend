import { Router } from "express";
import {
  logInAdmin,
  logOutAdmin,
  regesterAdmin,
  forgotPassword,
  getAllUsers,
  updateProfile,
  userAttendController,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkAdmin } from "../middlewares/isAdmin.middleware.js";
const router = Router();

//secure route
router.route("/register").post(verifyJWT, checkAdmin, regesterAdmin);
router.route("/forgot-passwword").post(forgotPassword);
router.route("/login").post(logInAdmin);

router.route("/logout").post(verifyJWT, logOutAdmin);
// router.route("/attendece").post(verifyJWT, userAttendController)
router.route("/update-profile").post(verifyJWT, updateProfile);

router.route("/getallusers").get(verifyJWT, checkAdmin, getAllUsers);

export default router;
