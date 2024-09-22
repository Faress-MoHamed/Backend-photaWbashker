import mongoose from "mongoose";
import Product from "../model/productModel.js";
import * as factory from "./handlerFactory.js";

import path from "path";
import catchAsync from "./../utils/catchAsync.js";
import sharp from "sharp";

// Create product
export const createProduct = catchAsync(async (req, res) => {
	const { name, quantity, price, Category } = req.body;
	const colors = JSON.parse(req.body.colors);
	const sizes = JSON.parse(req.body.sizes);

	// Check if there's an uploaded file
	let image = null;
	if (req.file) {
		// Crop and resize the image to 250x250
		const imagePath = `./uploads/cropped-${req.file.filename}`;
		await sharp(req.file.path)
			.resize(250, 250) // Crop to 250x250
			.toFile(imagePath);

		image = path.normalize(imagePath);
	}

	const product = new Product({
		name,
		quantity,
		price,
		image, // Store the cropped image path
		colors,
		sizes,
		Category,
	});

	await product.save();
	res.status(201).json(product);
});
//update product
export const updateProduct = catchAsync(async (req, res, next) => {
	const { name, quantity, price, Category } = req.body;
	const colors = JSON.parse(req.body.colors);
	const sizes = JSON.parse(req.body.sizes);

	let image = null;

	if (req.file) {
		// If a new image is uploaded, crop and resize the image to 250x250
		const imagePath = `./uploads/cropped-${req.file.filename}`;
		await sharp(req.file.path)
			.resize(250, 250) // Crop to 250x250
			.toFile(imagePath);

		image = path.normalize(imagePath);
	} else {
		// If no new image is uploaded, retain the existing image from the database
		const existingProduct = await Product.findById(req.params.id);
		if (!existingProduct) {
			return next(new AppError("No document found with that ID", 404));
		}
		image = existingProduct.image; // Retain the existing image
	}

	const newBody = {
		name,
		quantity,
		price,
		colors,
		sizes,
		Category,
		image,
	};

	const updatedDocument = await Product.findByIdAndUpdate(
		req.params.id,
		newBody,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!updatedDocument) {
		return next(new AppError("No document found with that ID", 404));
	}

	res.status(200).json({
		status: "success",
		data: updatedDocument,
	});
});

// Function to get all products and populate the category field

export const getProducts = catchAsync(async (req, res, next) => {
	// Extract category from query parameters
	const { Category } = req.query;
	// Build the query based on the presence of a category
	const query = Category ? { Category } : {};

	// Find products based on the query and populate the category field
	const products = await Product.find(query).populate({
		path: "Category",
		strictPopulate: false,
	});

	res.status(200).json({
		status: "success",
		result: products.length,
		data: products,
	});
});

// Get a single product by ID
// Basic function to get a product by ID
export const getProductById = catchAsync(async (req, res, next) => {
	const productId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(productId)) {
		return res.status(400).json({
			status: "error",
			message: "Invalid product ID format",
		});
	}

	const product = await Product.findById(productId).populate({
		path: "category",
		populate: "category",
		strictPopulate: false,
	});

	if (!product) {
		return res.status(404).json({
			status: "error",
			message: "Product not found",
		});
	}

	// Log to see if the category is being populated

	res.status(200).json({
		status: "success",
		data: product,
	});
});

// Delete a product by ID
export const deleteProduct = factory.deleteOne(Product);
