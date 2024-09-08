import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import User from "../model/userModel.js";
import * as factory from "./handlerFactory.js";

const filterObject = (userBodyObject, ...allowedFields) => {
	const newObject = {};
	Object.keys(userBodyObject).forEach((el) => {
		if (allowedFields.includes(el)) newObject[el] = userBodyObject[el];
	});
	return newObject;
};

export const updateMe = catchAsync(async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm)
		return next(
			new AppError(
				"This route is not for password updates. Please use /updateMyPassword",
				400
			)
		);
	const filtedBody = filterObject(req.body, "name", "email");
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filtedBody, {
		new: true,
		runValidators: true,
	});
	// console.log(updatedUser);
	res.status(200).json({
		status: "success",
		data: {
			user: updatedUser,
		},
	});
});


export const createUser = catchAsync((req, res, next) => {
	res.status(500).json({
		status: "error",
		message: "This route is not defined! Please use /signup instead",
	});
});

export const getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};
export const getAllUsers = factory.getAll(User);
export const getUserById = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
