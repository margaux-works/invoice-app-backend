const express = require('express'); // web framework for handling http requests
const mongoose = require('mongoose'); // ODM for MongoDB
const cors = require('cors'); // enables Cross-Origin Resource Sharing
const dotenv = require('dotenv'); // loads environment variable from a .env file
const bodyParser = require('body-parser'); // parses incoming request bodies
const morgan = require('morgan'); // logs http requests into file for debugging
const { check, validationResult } = require('express-validator'); // Validates user input (email format, required fields)

const { User, Invoice } = require('./models/models.js');

// Load environment variables
dotenv.config();

const app = express(); //
const PORT = process.env.PORT || 5001;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors()); // allows requests from all origins
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth.js')(app);
const passport = require('passport'); // handles authentication (JWT & Local strategy).
require('./passport.js');

app.use(morgan('common'));

// Placeholder route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// allow a new user to register
app.post(
  '/users',
  // Validation logic here for request
  [
    check('username', 'Username is required').isLength({ min: 5 }),
    check(
      'username',
      'username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    // validation logic
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = User.hashPassword(req.body.password);
    await User.findOne({ Username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + 'already exists');
        } else {
          User.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// allow user to update their data
app.put(
  '/users/:username',

  [
    check('username', 'Username must be at least 5 characters long')
      .optional()
      .isLength({ min: 5 }),
    check(
      'username',
      'username contains non-alphanumeric characters - not allowed.'
    )
      .optional()
      .isAlphanumeric(),
    check('password', 'Password is required').optional().not().isEmpty(),
    check('email', 'Email does not appear to be valid').optional().isEmail(),
  ],
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // Validation
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const updateData = {};
    if (req.body.username) updateData.username = req.body.username;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.password)
      updateData.password = User.hashPassword(req.body.password);

    await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: updateData },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// allow user to see the list of invoices
app.get('/invoices', (req, res) => {
  Invoice.find()
    .then((invoices) => {
      res.status(200).json(invoices);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// filter invoice by status
// app.get('/invoices', async (req, res) => {
//   const { status } = req.query;
//   const filter = status ? { status } : {};
//   try {
//     const invoices = await Invoice.find(filter);
//     res.status(200).json(invoices);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error: ' + err);
//   }
// });

// allow user to find an invoice by ID
app.get(
  '/invoices/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Invoice.findOne({ id: req.params.id })
      .then((invoice) => {
        res.json(invoice);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// allow user to create a new invoice (save as draft or save and send)
app.post(
  '/invoices',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const {
      id,
      createdAt,
      paymentDue,
      description,
      paymentTerms,
      clientName,
      clientEmail,
      status,
      total,
      senderAddress,
      clientAddress,
      items,
    } = req.body;

    // Validate status field
    if (!['draft', 'pending'].includes(status)) {
      return res
        .status(400)
        .send('Invalid status. Must be "draft" or "pending".');
    }

    // For pending invoices, validate all mandatory fields
    if (status === 'pending') {
      if (
        !id ||
        !paymentDue ||
        !description ||
        !paymentTerms ||
        !clientName ||
        !clientEmail ||
        !total ||
        !senderAddress?.street ||
        !senderAddress?.city ||
        !senderAddress?.postCode ||
        !senderAddress?.country ||
        !clientAddress?.street ||
        !clientAddress?.city ||
        !clientAddress?.postCode ||
        !clientAddress?.country ||
        !items?.length
      ) {
        return res
          .status(400)
          .send(
            'All mandatory fields must be filled to save and send the invoice.'
          );
      }

      // Validate items array for pending invoices
      const itemsValid = items.every(
        (item) =>
          item.name && item.quantity > 0 && item.price > 0 && item.total >= 0
      );
      if (!itemsValid) {
        return res
          .status(400)
          .send('Each item must have valid name, quantity, price, and total.');
      }
    }

    // create a new invoice
    const newInvoice = new Invoice({
      id,
      createdAt: createdAt || Date.now(),
      paymentDue,
      description,
      paymentTerms,
      clientName,
      clientEmail,
      status, // Either draft or pending
      total,
      senderAddress,
      clientAddress,
      items,
    });

    try {
      const savedInvoice = await newInvoice.save();
      res.status(201).json(savedInvoice);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// Update an invoice
app.put(
  '/invoices/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Extracting the status and other data from the request body
      const { status, ...invoiceData } = req.body;

      // Fetch the invoice to be updated
      const invoice = await Invoice.findOne({ id: req.params.id });

      if (!invoice) {
        return res
          .status(404)
          .send(`Invoice with ID ${req.params.id} was not found.`);
      }

      // Validation logic based on status
      if (status === 'pending') {
        // Ensure all required fields are present
        const requiredFields = [
          'paymentDue',
          'description',
          'paymentTerms',
          'clientName',
          'clientEmail',
          'total',
          'senderAddress',
          'clientAddress',
          'items',
        ];

        for (const field of requiredFields) {
          if (
            !invoiceData[field] ||
            (typeof invoiceData[field] === 'object' &&
              Object.keys(invoiceData[field]).length === 0)
          ) {
            return res
              .status(400)
              .send(
                `Field '${field}' is required to save the invoice as 'pending'.`
              );
          }
        }

        // Ensure that all nested fields in addresses and items are populated
        if (
          !invoiceData.senderAddress.street ||
          !invoiceData.senderAddress.city ||
          !invoiceData.senderAddress.postCode ||
          !invoiceData.senderAddress.country ||
          !invoiceData.clientAddress.street ||
          !invoiceData.clientAddress.city ||
          !invoiceData.clientAddress.postCode ||
          !invoiceData.clientAddress.country ||
          invoiceData.items.length === 0 ||
          invoiceData.items.some(
            (item) =>
              !item.name ||
              item.quantity == null ||
              item.price == null ||
              item.total == null
          )
        ) {
          return res
            .status(400)
            .send(
              `All fields in 'senderAddress', 'clientAddress', and 'items' must be filled to save as 'pending'.`
            );
        }
      }

      // Update the invoice
      const updatedInvoice = await Invoice.findOneAndUpdate(
        { id: req.params.id },
        { ...invoiceData, status },
        { new: true } // Return the updated document
      );

      res.status(200).json({
        message: `Invoice with ID ${req.params.id} was updated successfully.`,
        invoice: updatedInvoice,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err.message);
    }
  }
);

// Mark an invoice as paid
app.patch(
  '/invoices/:id/mark-as-paid',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Find the invoice by its ID
      const invoice = await Invoice.findOne({ id: req.params.id });

      // If the invoice doesn't exist, return a 404 error
      if (!invoice) {
        return res
          .status(404)
          .send(`Invoice with ID ${req.params.id} was not found.`);
      }

      // Update the status to 'paid'
      invoice.status = 'paid';
      const updatedInvoice = await invoice.save();

      // Respond with the updated invoice
      res.status(200).json({
        message: `Invoice with ID ${req.params.id} has been marked as paid.`,
        invoice: updatedInvoice,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err.message);
    }
  }
);

// delete an existing invoice
app.delete(
  '/invoices/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const deletedInvoice = await Invoice.findOneAndDelete({
        id: req.params.id,
      });
      if (!deletedInvoice) {
        return res
          .status(404)
          .send(`Invoice ${req.params.id}` + ' was not found');
      }
      res.status(200).send(`Invoice ${req.params.id}` + ' was deleted');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error:' + err);
    }
  }
);

//delete a user
app.delete(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const deletedUser = await User.findOneAndDelete({
        username: req.params.username,
      });
      if (!deletedUser) {
        return res.status(404).send(`User ${req.params.username} not found.`);
      }
      res.status(200).send(`User ${req.params.username} deleted successfully.`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
