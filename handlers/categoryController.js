import Category from "../model/CategoryModel.js";
import Product from "../model/productModel.js";
import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import path from "path";
import sharp from "sharp";

// Create a new category
export const createCategory = async (req, res, next) => {
	try {
		const { name } = req.body;

		// Ensure that both name and image are provided
		if (!name || !req.file) {
			return next(new AppError("Please provide name and image", 400));
		}

		// Crop and resize the image to 250x250
		const imagePath = `./uploads/cropped-${req.file.filename}`;
		await sharp(req.file.path)
			.resize(250, 250) // Crop to 250x250
			.toFile(imagePath);

		const image = path.normalize(imagePath);

		const category = await Category.create({
			name,
			image,
		});

		res.status(201).json({
			status: "success",
			data: {
				category,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const updateCategory = async (req, res, next) => {
	try {
		// Check if both body and file are provided
		if (!req.body && !req.file) {
			return res.status(400).json({
				status: "error",
				message: "Invalid request, no data provided",
			});
		}

		// Prepare the update data
		console.log(req);
		let updateData = { ...req.body };

		// If a new image is uploaded, handle the image cropping
		if (req.file) {
			const imagePath = `./uploads/cropped-${req.file.filename}`;
			await sharp(req.file.path)
				.resize(250, 250) // Crop to 250x250
				.toFile(imagePath);

			updateData.image = path.normalize(imagePath);
		} else {
			// If no new image is uploaded, retain the existing image from the database
			console.log("no image");
			const existingCategory = await Category.findById(req.params.id);
			if (!existingCategory) {
				return next(new AppError("No document found with that ID", 404));
			}
			updateData.image = existingCategory.image; // Retain the existing image
		}

		// Update the category
		const updatedCategory = await Category.findByIdAndUpdate(
			req.params.id,
			updateData,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!updatedCategory) {
			return next(new AppError("No category found with that ID", 404));
		}

		res.status(200).json({
			status: "success",
			data: {
				category: updatedCategory,
			},
		});
	} catch (error) {
		next(error);
	}
};

// Get all categories
export const getCategories = catchAsync(async (req, res, next) => {
	const categories = await Category.find();

	res.status(200).json({
		status: "success",
		results: categories.length,
		data: {
			categories,
		},
	});
});

// Get a single category by ID
export const getCategoryById = catchAsync(async (req, res, next) => {
	const category = await Category.findById(req.params.id);

	if (!category) {
		return next(new AppError("No category found with that ID", 404));
	}

	res.status(200).json({
		status: "success",
		data: {
			category,
		},
	});
});

// Delete a category by ID and associated products
export const deleteCategory = catchAsync(async (req, res, next) => {
	const doc = await Category.findByIdAndDelete(req.params.id);

	if (!doc) return next(new AppError("No document found with that ID", 404));

	// Delete all products associated with this category
	await Product.deleteMany({ Category: doc._id });

	res.status(200).json({
		status: "success",
		message: "Deleted Successfully",
	});
});
