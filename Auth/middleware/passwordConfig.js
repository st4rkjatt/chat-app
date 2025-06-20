
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import UserModel from "../models/authModel.js";

export const initilizingPassport = (passport) => {
  // ===================== local login ================================
  passport.use(
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          const user = await UserModel.findOne({ email: username });

          if (!user) {
            console.log("User does not exist");
            return done(null, false, req.flash("error", "User does not exist"));
          }
          if (user.password !== password) {
            return done(null, false, { message: "Incorrect password" });
          }

          const maxAge = 24 * 60 * 60; // 1 day in seconds
          const token = jwt.sign(
            { id: user._id, userName: user.userName, email: user.email },
            process.env.SECRET,
            { expiresIn: maxAge }
          );
          user.token = token;

          return done(null, user, req.flash("error", "User does exist"));
        } catch (err) {
          console.error(err);
          return done(err);
        }
      }
    )
  );

  //=========================== local sign up===============================
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          console.log('first');

          const existingUser = await UserModel.findOne({ email: username });
          if (existingUser) {
            return done(null, false, {
              message: "User already exists",
              status: 400,
            });
          } else {
            const newUser = await UserModel.create({
              email: username,
              password: password,
              userName: req.body.userName,
            });

            const maxAge = 24 * 60 * 60;
            const token = jwt.sign(
              { id: newUser._id, userName: req.body.username, email: username },
              process.env.SECRET,
              { expiresIn: maxAge }
            );
            newUser.token = token;

            return done(null, newUser, {
              message: "Signup successful",
              status: 200,
            });
          }
        } catch (err) {
          console.error(err, 'Error');
          return done(err);
        }
      }
    )
  );

  // =========================login by google===============
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await UserModel.findOne({ email: profile._json.email });

          if (!user) {
            return done(null, false, {
              message: "User not found.",
              status: 400,
            });
          }
          const maxAge = 24 * 60 * 60;
          const token = jwt.sign(
            { id: user._id, userName: user.userName, email: user.email },
            process.env.SECRET,
            { expiresIn: maxAge }
          );
          user.token = token;
          const img = profile._json.picture;
          if (img) user.avatarImage = img;
          return done(null, user);
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );

  // ==================================================
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  });
};
