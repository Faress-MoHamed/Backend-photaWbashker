import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
export default async (options) => {
	// console.log(process.env);
	// create a transporter
	try {
		const transporter = await nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		// email options
		const mailOptions = {
			from: "fares mohamed <fareess.mohameedd@gmail.com>",
			to: options.email,
			subject: options.subject,
			text: options.message,
		};

		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.log(error);
	}
};
