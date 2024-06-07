const Product = require("../models/productModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const ErrorHandler = require("../utils/errorHandler");

//yahan create product bna k fr route mein import krna

// post products
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// get all products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {

  const resultPerPage = 10;
  const productsCount = await Product.countDocuments();

  const apiFeatures = new ApiFeatures(Product.find(), req.query);
  apiFeatures.search().filter().pagination(resultPerPage);
  const products = await apiFeatures.query;
  res.status(200).json({ success: true, products, productsCount });
});

// get only single products
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }

  res.status(200).json({ success: true, product });
});

// put all update Admin products
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModifiy: false,
  });
  res.status(200).json({ success: true, product });
});

//  all delete Admin products
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }
  await product.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Product has been deleted successfully" });
});

//create new review  and update
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return next(
        new ErrorHandler(`Product not found with Id: ${productId}`, 404)
      );
    }

    const existingReview = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      // Add new review
      product.reviews.push(review);
      product.numOfReview = product.reviews.length;
    }

    let totalRating = 0;
    product.reviews.forEach((rev) => {
      totalRating += rev.rating;
    });

    product.ratings = totalRating / product.reviews.length;
    await product.save();

    res
      .status(201)
      .json({ success: true, message: "Review added successfully" });
  } catch (error) {
    return next(new ErrorHandler("Error creating product review", 500));
  }
});

// get all reviews
exports.getAllProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler(`Product not found`, 404));
  }
  res.status(200).json({ success: true, reviews: product.reviews });
});

// delete all reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  try {
    // Find the product using the provided productId
    const product = await Product.findById(req.query.productId);

    // Check if the product exists
    if (!product) {
      return next(new ErrorHandler(`Product not found`, 404));
    }

    // Filter out the review to be deleted from the product's reviews array
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );

    // Calculate new ratings and number of reviews
    let totalRating = 0;
    reviews.forEach((rev) => {
      totalRating += rev.rating;
    });
    const ratings = totalRating / reviews.length;
    const numOfReview = reviews.length;

    // Update the product with the modified reviews, ratings, and numOfReviews
    const updatedProduct = await Product.findByIdAndUpdate(
      req.query.productId,
      { reviews, ratings, numOfReview },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    // Respond with success and updated reviews
    res.status(200).json({ success: true, reviews: updatedProduct.reviews });
  } catch (error) {
    return next(new ErrorHandler("Error deleting review", 500));
  }
});

