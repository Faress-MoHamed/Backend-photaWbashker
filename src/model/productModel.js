import mongoose from "mongoose";
const { Schema } = mongoose;

const colorSchema = new Schema(
	{
		colorName: {
			type: String,
			required: true,
		},
		hexValue: {
			type: String,
			required: true,
			validate: {
				validator: function (v) {
					return /^#[0-9A-Fa-f]{6}$/.test(v);
				},
				message: (props) => `${props.value} is not a valid hex color code!`,
			},
		},
	},
	{ _id: false }
);

const sizeSchema = new Schema(
	{
		sizeName: {
			type: String,
			required: true,
		},
	},
	{ _id: false }
);

const productSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter product name"],
		},
		quantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, "Please enter price"],
			default: 0,
		},
		image: {
			type: String,
			required: [true, "Please upload an image"],
		},
		colors: {
			type: [colorSchema],
			required: [true, "Please provide at least one color"],
		},
		sizes: {
			type: [sizeSchema],
		},
		Category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		}, // Reference to Category model
	},
	{ timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
