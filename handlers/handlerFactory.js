import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import APIFeatures from "./../utils/apiFeatures.js";

export const deleteOne = (Model) => {
	return catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) return next(new AppError("No document found with that ID", 404));
		// await doc.remove();

		res.status(200).json({
			status: "success",
			message: "Deleted Successfully",
		});
	});
};
export const DelteMany = (Model, ModelTwo) => {
	return catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) return next(new AppError("No document found with that ID", 404));

		// Delete all products associated with this category
		await ModelTwo.deleteMany({ Category: doc._id });

		res.status(200).json({
			status: "success",
			message: "Deleted Successfully",
		});
	});
};

export const updateOne = (Model) => {
	return catchAsync(async (req, res, next) => {
		const updatedDocument = await Model.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!updatedDocument)
			return next(new AppError("No document found with that ID", 404));

		res.status(200).json({
			status: "success",
			data: updatedDocument,
		});
	});
};
export const createOne = (Model) => {
	return catchAsync(async (req, res, next) => {
		const newDocument = await Model.create(req.body);
		res.status(201).json({
			status: "success",
			data: {
				document: newDocument,
			},
		});
	});
};

export const getOne = (Model, populateOptions) => {
	return catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (populateOptions) query = query.populate(populateOptions);

		const document = await query;

		if (!document)
			return next(new AppError("No document found with that ID", 404));

		res.status(200).json({
			status: "success",
			data: document,
		});
	});
};

export const getAll = (Model, populateOptions) => {
	return catchAsync(async (req, res, next) => {
		let query = Model.find();

		if (populateOptions) query = query.populate(populateOptions);

		const documents = await query;

		if (!documents)
			return next(new AppError("No document found with that ID", 404));

		res.status(200).json({
			status: "success",
			result: documents.length,
			data: documents,
		});
	});
};
