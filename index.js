const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");

app.use(cors());
app.use(express.json());

function run() {
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zpaqsgt.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  const usersCollection = client.db('4wheelanes').collection('users');
  const carsCollection = client.db('4wheelanes').collection('cars');

  try {
    app.post('/users', async(req, res)=> {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);
    })

    app.get('/users', async(req, res)=> {
        const email = req.query.email;
        console.log(email);
        const query = {email:email};
        const cursor =await usersCollection.findOne(query);
        res.send(cursor);
    })

    app.post('/sellCar', async(req, res) => {
        const car = req.body;
        const result = await carsCollection.insertOne(car);
        res.send(result);
    })

    app.get('/dashboard/myProducts', async(req, res) => {
        const email = req.query.email;
        const query = {sellerEmail: email}
        const result = await carsCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/dashboard/productDetails/:id', async(req, res) => {
        const id = req.params.id;
        console.log(id);
        const query = {_id: ObjectId(id)};
        const result =await carsCollection.findOne(query);
        res.send(result)
    })

  } 
  catch {}
}
run();

app.get("/", (req, res) => {
  res.send("wheelanes server running");
});

app.listen(port, () => {
  console.log(`wheelanes server running on ${port}`);
});
