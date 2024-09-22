import { Router } from "express";
import multer from "multer";
import path from "path";
import * as productController from "../handlers/productController.js";
import * as authController from "../handlers/authController.js";
import express from "express";

const router = Router();

// Middleware to parse JSON
router.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/products");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({ storage });

router.route("/").get(productController.getProducts);
router.route("/:id").get(productController.getProductById);
// Protect all routes after this middleware
router.use(authController.protect);

// Routes for products
router.use(authController.restrictTo("admin", "owner")),
	router
		.route("/")
		.post(upload.single("image"), productController.createProduct);

router
	.route("/:id")
	.patch(upload.single("image"), productController.updateProduct)
	.delete(productController.deleteProduct);

export { router };
