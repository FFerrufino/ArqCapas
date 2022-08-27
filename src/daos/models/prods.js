const mongoose = require("mongoose");

const prodCollection = "prods";

const prodSchema = new mongoose.Schema({
  name: { type: String, required: true, max: 100 },
  img: { type: String, required: true, max: 100 },
  description: { type: String, required: true, max: 100 },
});

module.exports = mongoose.model(prodCollection, prodSchema);
