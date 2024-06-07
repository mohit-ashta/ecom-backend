const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
const FindErrorMiddleware = require("./middlewares/error");
const buyHomeRoutes = require("./routes/buyHomeRoutes");
const router = require("./routes/userRoutes");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const connectdb = require("./db/dbconnection");

// Import multer for file uploads
const multer = require("multer");

dotenv.config();
connectdb();

// Define the path to your uploaded images
const UPLOADS_PATH = "uploads";

// Serve uploaded images as static files
app.use("/uploads", express.static(UPLOADS_PATH));

// uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`error:${err.message}`);
  console.log(`shutting down your server due to uncaught Exception`);
  process.exit(1);
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware routes import
app.use("/api/v1", buyHomeRoutes);
app.use("/api/v1", router);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log("http://192.168.1.11:" + PORT);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`shutting down server due to unhandled promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_PATH); // Define the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Define how uploaded files should be named
  },
});

const upload = multer({
  storage: storage,
});
