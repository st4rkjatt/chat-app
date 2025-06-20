const express = require("express");
const connectDB = require("./dbConfig");
const ErrorMiddleware = require("./middleware/ErrorMiddleware");
// const app = express();
const PORT = 13000;
const cors = require("cors");
const passport = require("passport");
const { initilizingPassport } = require("./middleware/passwordConfig");
const expressSession = require("express-session");
const { server, app } = require("./socket/socket");
const flash = require("connect-flash");
require('dotenv').config();
initilizingPassport(passport);
app.use(
  expressSession({ secret: process.env.SECRET, resave: false, saveUninitialized: false })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
const messageRoutes = require("./routes/messageRoutes");
const { createClient } = require("redis");
const rabbitMQ = require("./services/rabbitMq");

connectDB();
rabbitMQ()
// app.use(cors());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

const redisClient = createClient({
  url: process.env.MY_REDIS
})

redisClient.connect().then(() => {
  console.log('connected to redis')
}).catch((err) => {
  console.log(err, 'redis error')
})

app.use("/api/v1/message", messageRoutes);



app.post("/logins", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      // Authentication failed, handle the failure
      const message = req.flash("error")[0] || "Invalid credentials";
      return res.status(400).json({ status: false, message });
    }

    // Authentication succeeded, log in the user
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      // User is logged in, send a success response
      res.json({ status: true, user, msg: "User login successfully." });
    });
  })(req, res, next);
});
// =============signup===========================
app.post("/signup", (req, res, next) => {
  passport.authenticate("local-signup", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      // Authentication failed, handle the failure
      const message = info.message || "Invalid credentials";
      const status = info.status || 400;
      return res.status(status).json({ status: false, message });
    }

    // Authentication succeeded, log in the user
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      // User is logged in, send a success response
      const msg = info.message || "Signup successful";
      const status = info.status || 200;
      res.status(status).json({ status: true, user, msg });
    });
  })(req, res, next);
});

app.get("/test", isAuth, (req, res) => {
  req.session.test ? req.session.test++ : (req.session.test = 1);
  res.json({ key: req.session.test, user: req.user });
});

app.post("/logout", (req, res) => {
  req.logOut(function (err) {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logout successfully" });
  });
});

function isAuth(req, res, done) {
  if (req.user) {
    return done();
  }
  return res.status(500).json({ success: false, message: "Session expired." });
}

/** FOR GOOGLE AUTH SIGNUP AND LOGIN */

app.get("/auth/google", passport.authenticate("google", { scope: ["email", "profile"] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('login successfully222.')
    // Successful authentication, redirect or respond as needed
    // res.redirect('http://localhost:5173/dashboard');  
    return res.status(200).json({ status: true, user: req.user, msg: "login successfully." })
  }
);


app.get('/login/google', passport.authenticate('google', { scope: ['email'] }));

app.get('/oauth2/redirect/google',
  passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
  function (req, res) {
    console.log('login successfully.')
    res.redirect('http://localhost:5173/dashboard');
  });

// ====================================================================

app.use(ErrorMiddleware);
server.listen(PORT, () => console.log(`Server Connected to port ${PORT}`));

module.exports = { redisClient }