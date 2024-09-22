import * as userController from "../handlers/userController.js";
import express from "express";
import * as authController from "../handlers/authController.js";

const router = express.Router();

// Login route (does not need protection)
router.post("/login", authController.login);

// Protect all routes after this middleware
router.use(authController.protect);

// Add role-based restrictions after the user is authenticated
router.use(authController.restrictTo("owner"));
router.route("/").get(userController.getAllAdmins);
router.post("/addAdmin", authController.addAdmin);

// Routes for updating password and profile
router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUserById);

// Update user profile (only for the logged-in user)
router.patch("/updateMe", userController.updateMe);

// Restrict the following routes to owners
router.use(authController.restrictTo("owner"));
router
	.route("/:id")
	.get(userController.getUserById)
	.patch(userController.updateAdmin)
	.delete(userController.deleteAdmin);

export { router };
