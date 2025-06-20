import jwt from "jsonwebtoken";
import UserModel from "../models/authModel.js";
import ErrorMiddleware from "../utils/ErrorHandler.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(403).json({ message: "Token not provided" });
    }

    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token has been expired" });
      }

      req.userId = decoded.id;
      const findUser = await UserModel.findById(req.userId);
      if (!findUser) {
        return next(new ErrorMiddleware("User not found.", 400));
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};
