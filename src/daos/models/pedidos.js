const mongoose = require("mongoose");

const pedidoCollection = "pedidos";

const pedidoSchema = new mongoose.Schema({
  username: { type: String, required: true, max: 100 },
  email: { type: String, required: true, max: 100 },
  number: { type: Number, required: true },
  pedido: { type: String, required: true },
});

module.exports = mongoose.model(pedidoCollection, pedidoSchema);
