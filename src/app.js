import express from "express";
import { PORT } from "../config.js";
import { ConnectionDB } from "./Database/Connection.js";
import { router as productRouter } from "./Routes/ProductRoute.js";
import globalErrorHandler from "./handlers/errorController.js";

import cors from "cors";
import { router as categoryRouter } from "./Routes/CategoryRoute.js";
import { router as userRouter } from "./Routes/UserRoute.js";
import dotenv from "dotenv";

const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

dotenv.config({ path: "./.env" });
const app = express();

// const uploadsPath = path.resolve("uploads");

app.use(cors());

app.use("/uploads", express.static("uploads"));

app.use(express.json());

app.use(
	cors({
		origin: "http://localhost:5173",
		methods: allowedMethods,
	})
);
// app.use(express.urlencoded({ extended: true }));
app.use("/api/products", productRouter);

app.use("/api/categories", categoryRouter);

app.use("/api/users", userRouter);
app.use(globalErrorHandler);

if (ConnectionDB) {
	app.listen(PORT, () => {
		console.log(`Server Running on PORT ${PORT}`);
	});
}
