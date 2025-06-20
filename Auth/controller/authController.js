
import jwt from "jsonwebtoken";
import ErrorMiddleware from "../utils/ErrorHandler.js";
import nodemailer from "nodemailer";
import randomnumber from "randomstring";
import ErrorHandler from "../utils/ErrorHandler.js";
import UserModel from "../models/authModel.js";

const config = {
    userEmail: process.env.USER_EMAIL,
    userPassword: process.env.USER_PASSWORD,
    secret: process.env.USER_SECRET,
};

export const Register = async (req, res, next) => {
    try {
        const { userName, email, password } = req.body;
        if (!userName) {
            return res
                .status(400)
                .json({ status: false, message: "User name is required!" });
        }
        if (!email) {
            return res
                .status(400)
                .json({ status: false, message: "User email is required!" });
        }
        if (!password) {
            return res
                .status(400)
                .json({ status: false, message: "User password is required!" });
        }
        const checkUser = await UserModel.findOne({
            email: { $regex: `^${email}$`, $options: "i" },
        });

        if (checkUser) {
            return res
                .status(400)
                .json({ status: false, message: "User Already exits." });
        }
        const createUser = await UserModel.create({
            ...req.body,
        });

        const newUser1 = createUser.toJSON();
        delete newUser1.password;

        const maxAge = 24 * 60 * 60; // 1 day in seconds
        const token = jwt.sign(
            { id: createUser._id, userName, email: email },
            process.env.SECRET,
            {
                expiresIn: maxAge,
            }
        );
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // Convert seconds to milliseconds
        });
        res.status(200).json({
            status: true,
            data: {
                ...newUser1,
                token,
            },
            message: "User has created successfully.",
        });
    } catch (error) {
        next(error);
    }
};

export const Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res
                .status(400)
                .json({ status: false, message: "User email is required!" });
        }
        if (!password) {
            return res
                .status(400)
                .json({ status: false, message: "User password is required!" });
        }

        const checkUser = await UserModel.findOne({
            email: { $regex: `^${email}$`, $options: "i" },
        });
        if (!checkUser) {
            return next(new ErrorHandler("User email not found.", 400));
        }

        if (password != checkUser.password) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid user password" });
        }

        const maxAge = 3 * 60 * 60;
        const token = jwt.sign(
            { id: checkUser._id, userName: checkUser.userName, email: email },
            process.env.SECRET,
            {
                expiresIn: maxAge, // 3hrs in sec
            }
        );
        await UserModel.findOneAndUpdate(
            { email: { $regex: `^${email}$`, $options: "i" } },
            { token: token },
            { new: true, runValidators: true, useFindAndModify: false }
        );
        const user1 = checkUser.toJSON();
        delete user1.password;
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // 3hrs in ms
        });

        res.status(200).json({
            status: true,
            data: { ...user1, token },
            message: "User login successfully.",
        });
    } catch (error) {
        next(error);
    }
};

export const ForgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new ErrorMiddleware("Email is required.", 400));
        }

        const data = await UserModel.findOne({
            email: { $regex: `^${email}$`, $options: "i" },
        });

        if (!data) {
            return next(new ErrorMiddleware("This email doesn't exist.", 400));
        }

        const OTP = randomnumber.generate({
            length: 6,
            charset: "numeric",
        });

        const mailOptions = {
            from: config.userEmail,
            to: email,
            subject: "Forgot password",
            text: `Your OTP  : ${OTP}`,
        };

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.userEmail,
                pass: config.userPassword,
            },
        });

        await UserModel.findOneAndUpdate(
            { email: email },
            {
                otp: OTP,
            },
            { new: true, runValidators: true, useFindAndModify: false }
        );

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return next(new ErrorMiddleware("Failed to send email.", 500));
            }
            res.status(200).json({
                status: true,
                msg: "OTP has been sent successfully.",
                data: req.body,
            });
        });
    } catch (error) {
        next(error);
    }
};

export const VerifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email) {
            return next(new ErrorMiddleware("Email is required.", 400));
        }
        if (!otp) {
            return next(new ErrorMiddleware("OTP is required.", 400));
        }

        const data = await UserModel.findOne({ email: email });

        if (!data) {
            return next(new ErrorMiddleware("Email did not match.", 400));
        }

        if (otp != data.otp) {
            return next(new ErrorMiddleware("Invalid OTP", 400));
        }

        res.status(200).json({
            status: true,
            msg: "OTP has been verified successfully.",
        });
    } catch (error) {
        next(error);
    }
};

export const ResetPassword = async (req, res, next) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email) {
            return next(new ErrorMiddleware("Email is required.", 400));
        }
        if (!password) {
            return next(new ErrorMiddleware("Password is required.", 400));
        }
        if (!confirmPassword) {
            return next(new ErrorMiddleware("Confirm Password is required.", 400));
        }
        if (password != confirmPassword) {
            return next(new ErrorMiddleware("Password didn't match.", 400));
        }
        if (password.length < 6) {
            return next(
                new ErrorMiddleware("Password  must be greater than 6 digit", 400)
            );
        }

        const data = await UserModel.findOne({
            email: { $regex: `^${email}$`, $options: "i" },
        });

        if (!data) {
            return next(new ErrorMiddleware("This email doesn't exist.", 400));
        }

        if (!data.otp) {
            return next(
                new ErrorMiddleware("Unexpected authentication failure", 400)
            );
        }

        const updateUser = await UserModel.findOneAndUpdate(
            { email: email },
            {
                password: password,
                otp: "",
            },
            { new: true, runValidators: true, useFindAndModify: false }
        );

        res.status(200).json({
            status: true,
            msg: "Password has been changed successfully.",
            data: updateUser,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUser = async (req, res, next) => {
    try {
        const { token } = req.query;
        res.status(200).json({
            status: true,
            data: token,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserForSidebar = async (req, res, next) => {
    try {

        const loggedInUserId = req.userId
        const getAllUsers = await UserModel.find({
            _id: { $ne: loggedInUserId }
        }).select('-password')

        res.status(200).json({
            status: true,
            data: getAllUsers
        })
    } catch (error) {
        next(error);
    }
}
