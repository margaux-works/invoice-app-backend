const mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
});

let invoiceSchema = mongoose.Schema({
  id: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  paymentDue: {
    type: Date,
    required: function () {
      return this.status === 'pending';
    },
  },
  description: {
    type: String,
    required: function () {
      return this.status === 'pending';
    },
  },
  paymentTerms: {
    type: Number,
    required: function () {
      return this.status === 'pending';
    },
  },
  clientName: {
    type: String,
    required: function () {
      return this.status === 'pending';
    },
  },
  clientEmail: {
    type: String,
    required: function () {
      return this.status === 'pending';
    },
  },
  status: { type: String, required: true },
  total: {
    type: Number,
    required: function () {
      return this.status === 'pending';
    },
  },
  senderAddress: {
    street: {
      type: String,
      required: function () {
        return this.status === 'pending';
      },
    },
    city: {
      type: String,
      required: function () {
        return this.status === 'pending';
      },
    },
    postCode: {
      type: String,
      required: function () {
        return this.status === 'pending';
      },
    },
    country: {
      type: String,
      required: function () {
        return this.status === 'pending';
      },
    },
  },
  clientAddress: {
    street: {
      type: String,
      required: function () {
        return this.status === 'pending';
      },
    },
    city: {
      type: String,
      required: function () {
        return this.status === 'pending';
      },
    },
    postCode: {
      type: String,
      required: function () {
        return this.status === 'pending';
      },
    },
    country: {
      type: String,
      required: function () {
        return this.status === 'pending';
      },
    },
  },
  items: [
    {
      name: {
        type: String,
        required: function () {
          return this.status === 'pending';
        },
      },
      quantity: {
        type: Number,
        required: function () {
          return this.status === 'pending';
        },
      },
      price: {
        type: Number,
        required: function () {
          return this.status === 'pending';
        },
      },
      total: {
        type: Number,
        required: function () {
          return this.status === 'pending';
        },
      },
    },
  ],
});

// hashes a user's password using bcyript
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

module.exports.User = mongoose.model('User', userSchema);
module.exports.Invoice = mongoose.model('Invoice', invoiceSchema);
