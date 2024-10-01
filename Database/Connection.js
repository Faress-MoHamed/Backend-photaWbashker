import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connecting to MongoDB Database
const mongodbURI = process.env.DATABASE_URI;
// console.log(process.env.DATABASE_URI);
export const ConnectionDB = mongoose
	.connect(mongodbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("MongoDB Connected💖");
	})
	.catch((error) => {
		console.log(`Error: ${error.message}`);
	});
