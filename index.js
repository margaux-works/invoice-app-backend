const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const morgan = require('morgan');

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
app.use(morgan('common'));

// Placeholder route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const { User, Invoice } = require('./models/models');

app.get('/test-db', async (req, res) => {
  try {
    // Create a test user
    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
    });
    await user.save();

    res.status(200).send({ message: 'Test data created', user });
  } catch (err) {
    res.status(500).send({ message: 'Error:', error: err.message });
  }
});

app.get('/test-invoice', async (req, res) => {
  try {
    // Create a sample invoice based on your schema
    const invoice = new Invoice({
      id: 'RT3080',
      createdAt: '2021-08-18',
      paymentDue: '2021-08-19',
      description: 'Re-branding',
      paymentTerms: 1,
      clientName: 'John Lock',
      clientEmail: 'johnlock@mail.com',
      status: 'paid',
      total: 1800.9,
      senderAddress: {
        street: 'Sonnenallee 23',
        city: 'Berlin',
        postCode: '12059',
        country: 'Berlin',
      },
      clientAdress: {
        street: '106 Kendell Street',
        city: 'Sharrington',
        postCode: 'NR24 5WQ',
        country: 'United Kingdom',
      },
      items: [
        {
          name: 'Brand Guidelines',
          quantity: 1,
          price: 1800.9,
          total: 1800.9,
        },
      ],
    });

    // Save the invoice to the database
    await invoice.save();

    // Respond with success and the created invoice
    res.status(201).send({ message: 'Invoice created successfully', invoice });
  } catch (err) {
    // Handle errors
    res
      .status(500)
      .send({ message: 'Error creating invoice', error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
