import crypto from "node:crypto";

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		requried: [true, "Please tell us your name"],
		trim: true,
	},
	email: {
		type: String,
		required: [true, "Please tell us your email"],
		lowercase: true,
		unique: true,
		validate: [validator.isEmail, "Please provide a valid email"],
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user",
	},
	password: {
		type: String,
		requried: [true, "Please provide a password"],
		minLength: [8, "The password must have more or equal then 8 characters"],
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, "Please confirm your password"],
		validate: {
			// This only works on CREATE and SAVE!!!
			validator: function (passwordConfirm) {
				return this.password === passwordConfirm;
			},
			message: "Passwords are not the same!",
		},
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExprires: Date,
});
// add new user
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre("save", function (next) {
	if (!this.isModified("password") || this.isNew) return next();
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

userSchema.pre(/^find/, function (next) {
	// this points to the current query
	this.find({ active: { $ne: false } });
	next();
});

// instance methods -> methods that will be exits in all documetns
userSchema.methods.correctPassword = async function (
	requestBodyPassowrd,
	databaseUserPassword
) {
	return await bcrypt.compare(requestBodyPassowrd, databaseUserPassword);
};

// check if the user change his password
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);
		return JWTTimestamp < changedTimestamp;
	}
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");
	this.passwordResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");
	this.passwordResetExprires = Date.now() + 1000 * 60 * 1000;
	console.log({ resetToken }, this.passwordResetToken);
	return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
