const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { dataSchema, reviewSchema } = require("../schemas.js");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, validateData, isAuthor } = require("../middleware");
//////////////// MODEL IMPORT ///////////////////
const Campground = require("../models/campground");

//////////////// MAIN OV ///////////////////
// campgrounds.index comes from the controller
router.get("/", catchAsync(campgrounds.index));

//////////////// ADD ROUTE GET ///////////////////
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

//////////////// ADD ROUTE POST ///////////////////
router.post(
  "/",
  isLoggedIn,
  validateData,
  catchAsync(campgrounds.createCampground)
);

//////////////// DV ROUTE ///////////////////
router.get("/:id", catchAsync(campgrounds.showCampground));

//////////////// EDIT ROUTE GET ///////////////////
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);
//////////////// EDIT ROUTE POST ///////////////////
router.put(
  "/:id",
  isLoggedIn,
  validateData,
  catchAsync(campgrounds.updateCampground)
);

//////////////// DELETE ROUTE CAMPGROUND ///////////////////
router.delete("/:id", catchAsync(campgrounds.deleteCampground));
module.exports = router;
