const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
// Use built-in express middleware for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

// Updated connection string to use 'mongodb' service name
// Connect to MongoDB
mongoose.connect('mongodb://db_container:27017/dealerships');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));

// Use 'once' to ensure seeding only happens after connection is successful
db.once('open', async () => {
    console.log("Connected to MongoDB");
    try {
        await Reviews.deleteMany({});
        await Reviews.insertMany(reviews_data['reviews']);
        
        await Dealerships.deleteMany({});
        await Dealerships.insertMany(dealerships_data['dealerships']);
        
        console.log("Database seeded successfully");
    } catch (error) {
        console.error('Error seeding data:', error);
    }
});

const Reviews = require('./review');
const Dealerships = require('./dealership');

try {
  Reviews.deleteMany({}).then(() => {
    Reviews.insertMany(reviews_data['reviews']);
  });
  Dealerships.deleteMany({}).then(() => {
    Dealerships.insertMany(dealerships_data['dealerships']);
  });
} catch (error) {
  console.error('Initial data load error:', error);
}

// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API")
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({dealership: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
    try {
      const documents = await Dealerships.find();
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching dealerships' });
    }
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
    try {
        const documents = await Dealerships.find({ state: req.params.state });
        res.status(200).json(documents);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching dealerships by state' });
      }
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
    try {
        const document = await Dealerships.find({ id: req.params.id });
        res.status(200).json(document);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching dealer by id' });
      }
});

// Express route to insert review
app.post('/insert_review', async (req, res) => {
  try {
    const data = req.body;
    const documents = await Reviews.find().sort({ id: -1 });
    let new_id = documents.length > 0 ? documents[0]['id'] + 1 : 1;

    const review = new Reviews({
        "id": new_id,
        "name": data['name'],
        "dealership": data['dealership'],
        "review": data['review'],
        "purchase": data['purchase'],
        "purchase_date": data['purchase_date'],
        "car_make": data['car_make'],
        "car_model": data['car_model'],
        "car_year": data['car_year'],
    });

    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Updated listen for Docker: Listen on 0.0.0.0
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});