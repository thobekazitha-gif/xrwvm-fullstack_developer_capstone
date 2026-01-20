/*jshint esversion: 8 */
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

mongoose.connect('mongodb://db_container:27017/dealerships');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));

const Reviews = require('./review');
const Dealerships = require('./dealership');

db.once('open', async () => {
    console.log("Connected to MongoDB");
    try {
        await Reviews.deleteMany({});
        await Reviews.insertMany(reviews_data.reviews);
        
        await Dealerships.deleteMany({});
        await Dealerships.insertMany(dealerships_data.dealerships);
        
        console.log("Database seeded successfully");
    } catch (error) {
        console.error('Error seeding data:', error);
    }
});

app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API");
});

app.get('/fetchReviews', async (req, res) => {
    try {
        const documents = await Reviews.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

app.get('/fetchReviews/dealer/:id', async (req, res) => {
    try {
        const documents = await Reviews.find({ dealership: req.params.id });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

app.get('/fetchDealers', async (req, res) => {
    try {
        const documents = await Dealerships.find();
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dealerships' });
    }
});

app.get('/fetchDealers/:state', async (req, res) => {
    try {
        const documents = await Dealerships.find({ state: req.params.state });
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dealerships by state' });
    }
});

app.get('/fetchDealer/:id', async (req, res) => {
    try {
        const document = await Dealerships.find({ id: req.params.id });
        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dealer by id' });
    }
});

app.post('/insert_review', async (req, res) => {
    try {
        const data = req.body;
        const documents = await Reviews.find().sort({ id: -1 });
        let new_id = documents.length > 0 ? documents[0].id + 1 : 1;

        const review = new Reviews({
            "id": new_id,
            "name": data.name,
            "dealership": data.dealership,
            "review": data.review,
            "purchase": data.purchase,
            "purchase_date": data.purchase_date,
            "car_make": data.car_make,
            "car_model": data.car_model,
            "car_year": data.car_year,
        });

        const savedReview = await review.save();
        res.json(savedReview);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error inserting review' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
