const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      //login() method makes sure a user gets logged in right after register
      req.login(registeredUser, err => {
        if (err) return next(err);
        req.flash("success", "You have been signed up. Welcome!!!");
        res.redirect("/campgrounds");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});
//Argument being passed to authenticate() is which form of authentication is being used
//Everything in {} afterwards are the specified options
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
  }),
  (req, res) => {
    req.flash("success", "Welcome Back");
    //This guarantees, that the last path is being saved and returns after login
    //Setup in middleware.js
    const redirectUrl = req.session.returnTo || "/campgrounds";
    //This takes the returnTo info out so it cannot be seen
    delete req.session.returnTo;
    res.redirect("redirectUrl");
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("info", "You logged out Successfully");
  res.redirect("/campgrounds");
});

module.exports = router;
