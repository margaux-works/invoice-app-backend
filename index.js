const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { check, validationResult } = require('express-validator');

const { User, Invoice } = require('./models/models.js');

// Load environment variables
dotenv.config();

const app = express();
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
const passport = require('passport');
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
