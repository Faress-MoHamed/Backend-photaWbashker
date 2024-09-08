import * as userController from "../handlers/userController.js";
import express from "express";
import * as authController from "../handlers/authController.js";

const router = express.Router();

router.post("/signup", authController.signup);//dn
router.post("/login", authController.login);//dn
// router.post("/forgetPassword", authController.forgetPassword);
// router.patch("/resetPassword", authController.resetPassword);

// protect all routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUserById);
//in update the user only name and email
router.patch("/updateMe", userController.updateMe);

router.use(authController.restrictTo("admin"));

router
	.route("/")
	.get(userController.getAllUsers)
	.post(userController.createUser);
router
	.route("/:id")
	.get(userController.getUserById)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

export { router };
