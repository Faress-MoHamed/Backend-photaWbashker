import { Router } from "express";
import * as reviewController from "../handlers/ReviewController.js";
import * as authController from "../handlers/authController.js";
import express from "express";

const router = Router();

// Middleware to parse JSON
router.use(express.json());

// Public routes for fetching reviews
router.route("/").get(reviewController.getReviews);
router.route("/:id").get(reviewController.getReviewById);

// Protect all routes after this middleware
router.use(authController.protect);

// Only allow admins or owners to create, update, or delete reviews
router.use(authController.restrictTo("admin", "owner"));

router.route("/").post(reviewController.createReview);
router
	.route("/:id")
	.patch(reviewController.updateReview)
	.delete(reviewController.deleteReview);

export { router };
