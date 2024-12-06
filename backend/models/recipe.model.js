import mongoose from "mongoose";

// Review Schema
const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true }); // Optionally add timestamps to reviews

// Recipe Schema
const recipeSchema = new mongoose.Schema({
  userOwner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
    minlength: 2,
  },
  recipeImg: {
    type: String,
    default: "", // Optional default value
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  ingredients: { type: [String], required: true },
  instructions: {
    type: String,
    required: true,
  },
  cookingTime: {
    type: Number,
    required: true,
    min: 1, // Minimum cooking time in minutes
  },
  rating: {
    type: Number,
    default: 0,
    min: 0, // Ensure rating cannot be less than 0
  },
  numReviews: {
    type: Number,
    default: 0,
    min: 0, // Ensure number of reviews cannot be negative
  },
  reviews: [reviewSchema],
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
