///////// NPM PACKAGES //////////////
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const { dataSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
//////////////// MODEL IMPORT //////////////////
const User = require("./models/user");
const Campground = require("./models/campground");
const Review = require("./models/review");

//////////////// ROUTES IMPORT ///////////////////
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

//////////////// MONGO DB SETUP ///////////////////
mongoose.connect("mongodb://localhost:27017/new_yelp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("MONGO DATABASE CONNECTED");
});

//////////////// VIEW ENGINSE SETUP ///////////////////
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//////////////// USE ///////////////////
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

//////////////// USE SESSION ///////////////////
const sessionConfig = {
  secret: "testsecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

//////////////// USE  SESSION ///////////////////
// Needs to be before passport
app.use(session(sessionConfig));

//////////////// USE  FLASH ///////////////////
app.use(flash());

//////////////// USE  PASSPORT ///////////////////
app.use(passport.initialize());
app.use(passport.session());
//.authenticate(), .serializeUser(), deserializeUser() are built in methods from passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//////////////// USE MIDDLEWARE EVERYWHERE ///////////////////
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.info = req.flash("info");
  next();
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "colt@gmail.com", username: "colttt" });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});

//////////////// USE  ROUTEHANDLERS ///////////////////
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

///////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ROUTES ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
////////////////// 404 ROUTE /////////////////////////
// app.use((req, res) => {
//   res.status(404).send("NOT FOUND");
// });

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

////////////////// ERROR HANDLER /////////////////////////
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong";
  }
  res.status(statusCode).render("error", { err });
});

//////////////// SERVER ROUTE ///////////////////
app.listen(8080, () => {
  console.log("LISTENING ON PORT 8080");
});
