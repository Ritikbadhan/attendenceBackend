import { Router } from "express";
import {getAllUsers} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {checkAdmin} from "../middlewares/isAdmin.middleware.js"
const router = Router();

//Admin route
router.route("/getallusers").get(verifyJWT, checkAdmin, getAllUsers)


export default router;
