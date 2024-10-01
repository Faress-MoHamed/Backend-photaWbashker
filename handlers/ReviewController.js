import mongoose from "mongoose";
import Review from "../model/ReviewModal.js";
import * as factory from "./handlerFactory.js";
import catchAsync from "../utils/catchAsync.js";

// Create a new review
export const createReview = catchAsync(async (req, res) => {
	const { clientName, rating, reviewBody } = req.body;

	const review = new Review({
		clientName,
		rating,
		reviewBody,
	});

	await review.save();

	res.status(201).json({
		status: "success",
		data: review,
	});
});

// Update a review
export const updateReview = catchAsync(async (req, res, next) => {
	const { clientName, rating, reviewBody } = req.body;

	const updatedReview = await Review.findByIdAndUpdate(
		req.params.id,
		{ clientName, rating, reviewBody },
		{
			new: true, // Return the updated document
			runValidators: true, // Ensure validation is run on update
		}
	);

	if (!updatedReview) {
		return res.status(404).json({
			status: "error",
			message: "No review found with that ID",
		});
	}

	res.status(200).json({
		status: "success",
		data: updatedReview,
	});
});

// Get all reviews
export const getReviews = catchAsync(async (req, res) => {
	const reviews = await Review.find();

	res.status(200).json({
		status: "success",
		result: reviews.length,
		data: reviews,
	});
});

// Get a single review by ID
export const getReviewById = catchAsync(async (req, res, next) => {
	const reviewId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(reviewId)) {
		return res.status(400).json({
			status: "error",
			message: "Invalid review ID format",
		});
	}

	const review = await Review.findById(reviewId);

	if (!review) {
		return res.status(404).json({
			status: "error",
			message: "Review not found",
		});
	}

	res.status(200).json({
		status: "success",
		data: review,
	});
});

// Delete a review by ID
export const deleteReview = factory.deleteOne(Review);
