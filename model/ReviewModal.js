import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema(
	{
		clientName: {
			type: String,
			required: [true, "Please enter the client's name"],
		},
		rating: {
			type: Number,
			required: [true, "Please provide a rating"],
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating must be at most 5"],
		},
		reviewBody: {
			type: String,
			required: [true, "Please provide the review body"],
		},
	},
	{ timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
