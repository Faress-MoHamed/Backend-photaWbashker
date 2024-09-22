import { Router } from "express";
import express from "express";

import {
	createCategory,
	getCategories,
	getCategoryById,
	updateCategory,
	deleteCategory,
} from "../handlers/categoryController.js";
import * as authController from "../handlers/authController.js";
import multer from "multer";
import path from "path";

// Multer setup to store files
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/categories"); // Set the folder to store images
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, `category-${Date.now()}${ext}`); // Create a unique file name
	},
});

const upload = multer({ storage });

export const uploadCategoryImage = upload.single("image"); // for single file upload

export const router = Router();

// Middleware to parse JSON
router.use(express.json());

// Get all categories
router.get("/", getCategories);

router.get("/:id", getCategoryById);

router.use(authController.protect);
// Get a category by ID
router.use(authController.restrictTo("admin", "owner"));

// Create a new category
router.post("/", uploadCategoryImage, createCategory);

// Update a category by ID
router.patch("/:id", uploadCategoryImage, updateCategory);

// Delete a category by ID
router.delete("/:id", deleteCategory);
