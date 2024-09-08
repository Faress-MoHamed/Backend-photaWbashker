import mongoose from "mongoose";
import Product from "../model/productModel.js";
import * as factory from "./handlerFactory.js";

import path from "path";
import catchAsync from "../utils/catchAsync.js";

export const createProduct = async (req, res) => {
	try {
		const { name, quantity, price, Category } = req.body;
		const colors = JSON.parse(req.body.colors);
		const sizes = JSON.parse(req.body.sizes);

		// Normalize the image path
		const image = req.file ? path.normalize(req.file.path) : null;

		const product = new Product({
			name,
			quantity,
			price,
			image, // Store the normalized image file path
			colors,
			sizes,
			Category,
		});

		await product.save();
		res.status(201).json(product);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

// Function to get all products and populate the category field
export const getProducts = async (req, res, next) => {
	try {
		// Extract category from query parameters
		const { Category } = req.query;
		console.log(Category);
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
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "Failed to retrieve products",
			error: error.message,
		});
	}
};

// Get a single product by ID
// Basic function to get a product by ID
export const getProductById = async (req, res, next) => {
	try {
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
		console.log("Populated Product:", product);

		res.status(200).json({
			status: "success",
			data: product,
		});
	} catch (error) {
		console.error("Error fetching product:", error); // Log error details
		res.status(500).json({
			status: "error",
			message: "Failed to retrieve product",
			error: error.message,
		});
	}
};

// Update a product by ID
export const updateProduct = catchAsync(async (req, res, next) => {
	const { name, quantity, price, Category } = req.body;
	const colors = JSON.parse(req.body.colors);
	const sizes = JSON.parse(req.body.sizes);

	// Normalize the image path
	const image = req.file ? path.normalize(req.file.path) : null;

	// Prepare the update body
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

// Delete a product by ID
export const deleteProduct = factory.deleteOne(Product);
