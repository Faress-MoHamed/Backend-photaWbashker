import bcrypt from "bcryptjs";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import User from "../model/userModel.js";
import * as factory from "./handlerFactory.js";

// Utility function to filter allowed fields
const filterObject = (userBodyObject, ...allowedFields) => {
	const newObject = {};
	Object.keys(userBodyObject).forEach((el) => {
		if (allowedFields.includes(el)) newObject[el] = userBodyObject[el];
	});
	return newObject;
};

// Controller to update an admin's details (only for owners)
export const updateAdmin = catchAsync(async (req, res, next) => {
	// Only allow owners to update admins
	if (req.user.role !== "owner") {
		return next(
			new AppError("You do not have permission to perform this action", 403)
		);
	}

	// Filter out fields that are not allowed to be updated
	const filteredBody = filterObject(req.body, "username");

	// If password is being updated, validate and handle it separately
	if (req.body.password || req.body.passwordConfirm) {
		if (req.body.password !== req.body.passwordConfirm) {
			return next(new AppError("Passwords do not match", 400));
		}

		// Hash the new password
		const salt = await bcrypt.genSalt(12);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		// Update password directly
		const updatedAdmin = await User.findByIdAndUpdate(
			req.params.id,
			{
				password: hashedPassword,
			},
			{
				new: true,
				runValidators: true,
			}
		);

		if (!updatedAdmin) {
			return next(new AppError("No admin found with that ID", 404));
		}

		res.status(200).json({
			status: "success",
			data: {
				user: updatedAdmin,
			},
		});

		return;
	}

	// Update admin details excluding the password
	const updatedAdmin = await User.findByIdAndUpdate(
		req.params.id,
		filteredBody,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!updatedAdmin) {
		return next(new AppError("No user found with that ID", 404));
	}

	res.status(200).json({
		status: "success",
		data: {
			user: updatedAdmin,
		},
	});
});

// Controller to update the logged-in user's details (except password)
export const updateMe = catchAsync(async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				"This route is not for password updates. Please use /updateMyPassword",
				400
			)
		);
	}

	const filteredBody = filterObject(req.body, "name", "email");
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: "success",
		data: {
			user: updatedUser,
		},
	});
});

// Middleware to set user ID in params to the logged-in user's ID
export const getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

// Controller to get all admins (only for owners)
export const getAllAdmins = catchAsync(async (req, res, next) => {
	// Only allow owners to get all admins
	if (req.user.role !== "owner") {
		return next(
			new AppError("You do not have permission to perform this action", 403)
		);
	}

	const admins = await User.find({ role: "admin" });
	res.status(200).json({
		status: "success",
		results: admins.length,
		data: {
			admins,
		},
	});
});

// Controller to delete an admin (only for owners)
export const deleteAdmin = catchAsync(async (req, res, next) => {
	// Only allow owners to delete admins
	if (req.user.role !== "owner") {
		return next(
			new AppError("You do not have permission to perform this action", 403)
		);
	}

	const admin = await User.findByIdAndDelete(req.params.id);

	if (!admin) {
		return next(new AppError("No admin found with that ID", 404));
	}

	res.status(204).json({
		status: "success",
		data: null,
	});
});

export const getUserById = factory.getOne(User);
