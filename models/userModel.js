const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userRoles = ["user", "admin"];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Name cannt exceed 30 chararcters "],
    minLength: [3, "Name should have more than three chararcters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validator: [validator.isEmail, "Please enter valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your email"],
    minLength: [6, "Password should have more than 6 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
    enum: userRoles
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});


userSchema.pre("save", async function (next) {
  //agar modified nahi hai toh
  if (!this.isModified("password")) {
    console.log("password not hashed");
    next();
    //  password change hoyea toh next step jayega
  }
  // yahan pe password encrypted aw
  this.password = await bcrypt.hash(this.password, 10);
  console.log("password will be hashed");
});

// jwt token 
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
// compare password


// userSchema.methods.comparePassword = async function(password){
//   return await bcrypt.compare(password,this.password);
// }

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Use bcrypt to compare candidatePassword with the hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch; // Return true if passwords match, false otherwise
  } catch (error) {
    throw error;
  }
};
// reset password
userSchema.methods.getResetPasswordToken = function () {
  // crypto.generateKey
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 100;
  return resetToken;
};
module.exports = mongoose.model("User", userSchema);
