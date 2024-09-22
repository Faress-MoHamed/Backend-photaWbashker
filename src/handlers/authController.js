import { promisify } from "node:util";
import crypto from "node:crypto";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const generateJwtToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = generateJwtToken(user._id);
	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === "production") {
		cookieOptions.secure = true;
	}
	res.cookie("jwt", token, cookieOptions);

	user.password = undefined;

	res.status(statusCode).json({
		status: "success",
		token,
		data: {
			user,
		},
	});
};

export const login = catchAsync(async (req, res, next) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({
			message: "Username and password are required",
		});
	}

	const user = await User.findOne({ username }).select("+password");

	if (!user || !(await user.correctPassword(password, user.password))) {
		return res.status(401).json({
			message: "Invalid username or password",
		});
	}

	createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return next(
			new AppError("You are not logged in! Please log in to get access.", 401)
		);
	}

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	const freshUser = await User.findById(decoded.id);
	if (!freshUser) {
		return next(new AppError("User no longer exists", 401));
	}

	req.user = freshUser;
	next();
});

export const restrictTo = (...roles) => {
	return catchAsync(async (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError("You do not have permission to perform this action", 403)
			);
		}
		next();
	});
};

// AddAdmin function
export const addAdmin = catchAsync(async (req, res, next) => {
	// Check if the user adding the admin is an owner
	if (req.user.role !== "owner") {
		return next(new AppError("Only owners can add admins", 403));
	}

	const { username, password, passwordConfirm } = req.body;

	if (!username || !password || !passwordConfirm) {
		return res.status(400).json({
			message: "Username, password, and password confirmation are required",
		});
	}

	const newAdmin = await User.create({
		username,
		password,
		passwordConfirm,
		role: "admin",
	});

	createSendToken(newAdmin, 201, res);
});

export const resetPassword = catchAsync(async (req, res, next) => {
	let token = req.headers.cookie;
	token = token.split(";")[0].split("=")[1];

	const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});

	if (!user) {
		return next(new AppError("Token is invalid or has expired", 400));
	}

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");

	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError("Your current password is wrong!", 401));
	}

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();

	createSendToken(user, 200, res);
});
