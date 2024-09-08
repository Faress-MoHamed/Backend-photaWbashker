import mongoose from "mongoose";
const { Schema } = mongoose;

const categorySchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter category name"],
			unique: true,
		},
		image: {
			type: String, // You can store the image as a file path or URL
			required: [true, "Please upload a category image"],
		},
	},
	{ timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
