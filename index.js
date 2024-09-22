import express from "express";
import { PORT } from "./config.js";
import { ConnectionDB } from "./Database/Connection.js";
import { router as productRouter } from "./Routes/ProductRoute.js";
import globalErrorHandler from "./handlers/errorController.js";

import cors from "cors";
import { router as categoryRouter } from "./Routes/CategoryRoute.js";
import { router as userRouter } from "./Routes/UserRoute.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" }); // Load environment variables at the top
const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

const app = express();

// Middlewares
app.use(
	cors({
		methods: allowedMethods,
	})
);

app.use("/uploads", express.static("uploads"));
app.use(express.json());

// Routes
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/users", userRouter);

// Root route
app.use("/", (req, res) => {
	console.log("Connected");
	res.json("Hello World");
});

// Global error handler
app.use(globalErrorHandler);

// Server connection
if (ConnectionDB) {
	app.listen(PORT, () => {
		console.log(`Server Running on PORT ${PORT}`);
	});
}
