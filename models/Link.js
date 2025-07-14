const mongoose = require("mongoose");
const logSchema = new mongoose.Schema({
  clickedAt: {
    type: Date,
    default: Date.now,
  },
  referrer: String,
  location: String,
});
const linkSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
  },
  fullUrl: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  validTill: {
    type: Date,
    required: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  logs: [logSchema],
});
module.exports = mongoose.model("Link", linkSchema);
