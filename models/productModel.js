const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please fill this field"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "please fill this field"],
  },
  price: {
    type: Number,
    required: [true, "please fill this field"],
    maxLength: [8, "price cant exceed 8 no."]
  },
  rating: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }
  ],
  category: {
    type: String,
    required: [true, "please enter product category"],
  },
  stock: {
    type: Number,
    required: [true, "please enter product Number"],
    maxLength: [4, "price cant exceed 4 no."],
    default:1
  },
  numOfReview: {
    type: Number,
    default:0
  },
  reviews: [
    {
      user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
      },
       name:{
        type: String,
        required:true
       },
       rating: {
        type: Number,
        required:true
      },
      comment:{
        type:String,
        required:true
      }
      }
  ],
 
  createAt:{
    type:Date,
    default:Date.now
  }
});

module.exports = mongoose.model("Product",productSchema);   
