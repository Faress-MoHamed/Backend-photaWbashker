import AppError from "./../utils/appError.js";

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		error: err,
		stack: err.stack,
	});
};

const sendErrorProd = (err, res) => {
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
			// error: err,
		});
	} else {
		res.status(500).json({
			status: "error",
			message: "Something went wrong",
		});
	}
};

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path} is ${err.value}`;
	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = () => {
	const message = `Duplicate Field value please use another value`;
	return new AppError(message, 400);
};
const handleJsonWebTokenError = () => {
	const message = `Invalid token. Please log in again!`;
	return new AppError(message, 401);
};

const handleTokenExpiredError = () => {
	const message = `Your token has expired. Please log in again!`;
	return new AppError(message, 401);
};

export default (err, req, res, next) => {
	err.statusCode ||= 500;
	err.status ||= "error";

	if (process.env.NODE_ENV === "development") {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === "production") {
		let error = { ...err };
		if (error.name === "CastError") error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB();
		if (error.name === "JsonWebTokenError") error = handleJsonWebTokenError();
		if (error.name === "TokenExpiredError") error = handleTokenExpiredError();
		sendErrorProd(error, res);
	}
};
