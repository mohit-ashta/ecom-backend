const BuyHome = require("../models/buyHomeModal");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const ErrorHandler = require("../utils/errorHandler");
const mediaBuyHomeModal = require("../models/mediaBuyHomeModal");

// add home

// list of all home
exports.listHomes = catchAsyncErrors(async (req, res) => {
  try {
    const resultPerHomePage = 6;
    const homeCount = await BuyHome.countDocuments();
    const apiFeatures = new ApiFeatures(BuyHome.find().populate("media"), req.query);
    apiFeatures.search().filter().pagination(resultPerHomePage);
    apiFeatures.query.sort({ createdAt: -1 });
    // const buyHome = await BuyHome.find().populate('media')
    const homePerPage = await apiFeatures.query;
    return res.status(201).json({
      success: true,
      homePerPage,
      homeCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.getHomesDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    const buyHome = await BuyHome.findById(id).populate("media");

    if (!buyHome) {
      return next(new ErrorHandler("home not Found", 404));
    }

    res.status(200).json({
      success: true,
      buyHome,
    });
  } catch (error) {
    console.error("Error in deleteHome handler:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// list of all delete home
// Corrected deleteBuyHome controller function
exports.deleteHome = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid BuyHome ID",
      });
    }

    // Use findByIdAndDelete to find and delete the document
    const buyHome = await BuyHome.findByIdAndDelete(id);

    // Check if buyHome exists
    if (!buyHome) {
      return res.status(404).json({
        success: false,
        message: "BuyHome not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "BuyHome deleted successfully",
      buyHome,
    });
  } catch (error) {
    console.error("Error in deleteHome handler:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

exports.createBuyHome = catchAsyncErrors(async (req, res) => {
  try {
    console.log("req.body", req.body);
    console.log("req.files", req.files);
    if (req.files.length < 1) {
      return res.status(401).json({
        success: false,
        message: "Media is required",
      });
    }
    const medias = [];

    // Use await directly with BuyHome.create
    const buyHome = await BuyHome.create(req.body);

    for (let med = 0; med < req.files.length; med++) {
      const result = await mediaBuyHomeModal.create({
        url: req.files[med].originalname || "",
        product: buyHome._id,
        type: req.files[med].mimetype || "",
        path: req.files[med].path, // Store the file path
        filename: req.files[med].filename, // Store the file filename
      });
      medias.push(result);
    }

    // Update media field in BuyHome and save
    buyHome.media = medias;
    await buyHome.save();

    return res.status(201).json({
      success: true,
      buyHome,
      message: "Home is created successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
exports.updateHome = catchAsyncErrors(async (req, res) => {
  try {
    const { id } = req?.params;
    console.log("id", id);
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid BuyHome ID",
      });
    }

    // Find and update BuyHome
    const buyHome = await BuyHome.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run validators to ensure the update complies with the schema
    });
    console.log("body#############", req.body);
    // Check if BuyHome exists
    if (!buyHome) {
      return res.status(404).json({
        success: false,
        message: "BuyHome not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Home updated successfully",
      buyHome,
    });
  } catch (error) {
    console.error("Error in updateHome handler:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
