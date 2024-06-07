
const express = require("express");
const {
  createBuyHome,
  listHomes,
  deleteHome,
  getHomesDetails,
  updateHome,
} = require("../controllers/buyHomeContollers");
const multer = require("multer");
const path = require("path");
const { checkUserRole } = require("../middlewares/auth"); // Import your authentication middleware

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Define the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Define how uploaded files should be named
  },
});

const upload = multer({
  storage: storage,
});

const router = express.Router();

// Protect the createhome route
router
  .route("/createhome")
  .post(checkUserRole("admin"), upload.array("images", 20), createBuyHome);
// Protect the update route
router.route("/home/update/:id").put(checkUserRole("admin"), upload.array("images", 20), updateHome);

// Protect the deleteHome route
router.route("/home/list/:id").delete(checkUserRole("admin"), deleteHome);

// Public route for listing homes
router.route("/home/list").get(listHomes);

// Public route for getting home details
router.route("/home/:id").get(getHomesDetails);

module.exports = router;