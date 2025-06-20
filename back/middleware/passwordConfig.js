const UserModel = require("../model/userModels");
const localStrategy = require("passport-local").Strategy;
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
exports.initilizingPassport = (passport) => {
  // ===================== local login ================================
  passport.use(
    new localStrategy(
      {
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          const user = await UserModel.findOne({ email: username });

          if (!user) {
            console.log("User does not exist");
            // Redirect to a login page with a flash message
            return done(null, false, req.flash("error", "User does not exist"));
          }
          if (user.password !== password) {
            // Incorrect password
            return done(null, false, { message: "Incorrect password" });
          }
          // console.log(user, "????");

          // Proceed with successful authentication
          const maxAge = 24 * 60 * 60; // 1 day in seconds
          const token = jwt.sign(
            { id: user._id, userName: user.userName, email: user.email },
            process.env.SECRET,
            {
              expiresIn: maxAge,
            }
          );
          user.token = token;

          return done(null, user, req.flash("error", "User does  exist"));
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
    new localStrategy(
      {
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {

          console.log('first')

          const existingUser = await UserModel.findOne({ email: username });
          // console.log(username, "found existing")
          // console.log(req.body.username, "body1 username");
          // console.log(req.body.username, "body1 useremail");
          // console.log(req.body.userName, "userName");
          if (existingUser) {
            // User already exists
            return done(null, false, {
              message: "User already exists",
              status: 400, // Set the appropriate status code
            });
          } else {

            // Create a new user
            const newUser = await UserModel.create({
              email: username,
              password: password,
              userName: req.body.userName
            })
            // const newUser = new UserModel({
            //   email: username,
            //   password: password,
            //   userName: req.body.userName,

            // });


            // Proceed with successful signup

            // console.log(newUser,"newUser")
            const maxAge = 24 * 60 * 60; // 1 day in seconds
            const token = jwt.sign(
              { id: newUser._id, userName: req.body.username, email: username },
              process.env.SECRET,
              {
                expiresIn: maxAge,
              }
            );
            newUser.token = token;


            return done(null, newUser, {
              message: "Signup successful",
              status: 200, // Set the appropriate status code
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
          // Check if the user already exists in the database
          // console.log(profile, "profile22")
          let user = await UserModel.findOne({ email: profile._json.email });

          if (!user) {
            // User not exists
            return done(null, false, {
              message: "User not found.",
              status: 400, // Set the appropriate status code
            });
          } 
          // generate token 
          const maxAge = 24 * 60 * 60; // 1 day in seconds
          const token = jwt.sign(
            { id: user._id, userName: user.userName, email: user.email },
            process.env.SECRET,
            {
              expiresIn: maxAge,
            }
          );
          user.token = token
          const img = profile._json.picture
          profile._json.picture ? user.avatarImage=img : ''
          // console.log(user, "user login")
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

