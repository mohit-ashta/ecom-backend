
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login to access this resources", 401));
  }
  const deCodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(deCodedData.id);
  next();
});

exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role: ${req.user.role} is not allowed this resource`, 403));
    }
    next(); // Call next() to allow the request to continue to the next middleware
  };
};

// Middleware to check user role
// exports.checkUserRole = (requiredRole) => {
//   return (req, res, next) => {
//     // Get the token from the request headers
//     const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized: No token provided" });
//     }

//     // Verify the token
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         return res.status(401).json({ message: "Unauthorized: Invalid token" });
//       }

//       // Check if the user has the required role
//       const userRole = decoded.role;
//       if (!userRole || (requiredRole && !userRole.includes(requiredRole))) {
//         return res.status(403).json({ message: "Forbidden: Insufficient role permissions" });
//       }

//       // If everything is fine, proceed to the next middleware or route handler
//       next();
//     });
//   };
// };
exports.checkUserRole = (requiredRole) => {
  return (req, res, next) => {
    // Get the token from the request headers
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if the user has the required role
      const userRole = decoded.role;
      if (!userRole || (requiredRole && !userRole.includes(requiredRole))) {
        return res.status(403).json({ message: "Forbidden: Insufficient role permissions" });
      }

      // If everything is fine, proceed to the next middleware or route handler
      next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      } else {
        // Handle other errors (e.g., TokenExpiredError)
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  };
};