const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Create a controlled error response object
  const errorResponse = {
    success: false,
    error: {
      message: err.message,
    },
  };

  // Cast error handling for MongoDB
  if (err.name === "CastError") {
    const message = `Resource not found Invalid : ${err.path}`;
    const castError = new ErrorHandler(message, 404); // Create a new instance
    return res.status(castError.statusCode).json({
      success: false,
      error: {
        message: castError.message,
      },
    });
  }
  // mongoose dup key error

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    const mongooseDub = new ErrorHandler(message, 404); // Create a new instance
    return res.status(mongooseDub.statusCode).json({
      success: false,
      error: {
        message: mongooseDub.message,
      },
    });
  }

  // wrong JWT error

  if (err.name === "jsonWebTokenError") {
    const message = `json web token is invalid , try again`;
    const wrongJWT = new ErrorHandler(message, 404); // Create a new instance
    return res.status(wrongJWT.statusCode).json({
      success: false,
      error: {
        message: wrongJWT.message,
      },
    });
  }
  //jwt expire error

  if (err.name === "TokenExpiredError") {
    const message = `json web token is error , try again`;
    const expireJWT = new ErrorHandler(message, 404); // Create a new instance
    return res.status(expireJWT.statusCode).json({
      success: false,
      error: {
        message: expireJWT.message,
      },
    });
  }

  if (process.env.NODE_ENV === "development") {
    // In development mode, include the stack trace in the error response
    errorResponse.error.stack = err.stack;
  }
  // Send the error response
 res.status(err.statusCode).json(errorResponse);
};
