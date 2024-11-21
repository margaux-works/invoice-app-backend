const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
});

let invoiceSchema = mongoose.Schema({
  id: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  paymentDue: { type: Date, required: true },
  description: { type: String, required: true },
  paymentTerms: { type: Number, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  status: { type: String, required: true },
  total: { type: Number, required: true },
  senderAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  clientAdress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
});

module.exports.User = mongoose.model('User', userSchema);
module.exports.Invoice = mongoose.model('Invoice', invoiceSchema);
