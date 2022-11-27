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
  const categoriesCollection = client.db('4wheelanes').collection('carCategories')
  const reportedProductsCollection = client.db('4wheelanes').collection('reportedProducts')

  try {
    app.post('/users', async(req, res)=> {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);
    })

    app.get('/users', async(req, res)=> {
        const email = req.query.email;
        const query = {email:email};
        const cursor =await usersCollection.findOne(query);
        res.send(cursor);
    })

    app.delete('/deleteuser', async(req, res)=> {
        const id = req.query.id;
        const query = {_id: ObjectId(id)};
        const result = await usersCollection.deleteOne(query);
        res.send(result)
    })

    app.put('/makeadmin', async(req, res)=> {
        const id = req.query.id;
        const query = {_id: ObjectId(id)};
        updatedDoc={
            $set:{
                role: "Admin"
            }
        }
        const result = await usersCollection.updateOne(query, updatedDoc);
        res.send(result)
    })

    app.get('/alluser', async(req, res) => {
        const query = {};
        const result = await usersCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/allseller', async(req, res) => {
        const query = {role: 'Seller'};
        const result = await usersCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/allbuyer', async(req, res) => {
        const query = {role: 'Buyer/User'};
        const result = await usersCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/allProducts', async(req, res) => {
        const query = {};
        const result = await carsCollection.find(query).toArray();
        res.send(result)
    })

        app.get('/products/:category', async(req, res) => {
        const category = req.params.category;
        const query = {category: category,
                        status: 'Available'};
        const result = await carsCollection.find(query).toArray();
        res.send(result)
    })

    app.post('/reportProduct', async(req, res) => {
        const product = req.body;
        const result =await reportedProductsCollection.insertOne(product);
        res.send(result)
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

    app.put('/changeStatus', async(req, res) => {
        const id = req.query.id
        const query = {_id: ObjectId(id)}
        const options = {upsert: true};
        const updatedDoc = {
            $set: {
                status: "Sold"
            }
        }
        const result = await carsCollection.updateMany(query, updatedDoc, options)
        res.send(result)
    })

    app.delete('/deleteProduct', async(req, res)=> {
        const id = req.query.id;
        const query = {_id: ObjectId(id)}
        const result = await carsCollection.deleteOne(query);
        res.send(result);
    })

    app.get('/dashboard/productDetails/editProduct/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result =await carsCollection.findOne(query);
        res.send(result);
    })

    app.put('/updateCarDetails', async(req, res)=>{
        const id = req.query.id;
        const query = {_id: ObjectId(id)};
        const updatedCarDetails = req.body;
        const options = {upsert:true}
        const updatedDoc = {
            $set:{
                carName: updatedCarDetails?.carName,
                category: updatedCarDetails?.category,
                image: updatedCarDetails?.image,
                carDetails: updatedCarDetails?.carDetails,
                location: updatedCarDetails?.location,
                usingPeriod: updatedCarDetails?.usingPeriod,
                quality: updatedCarDetails?.quality,
                originalPrice: updatedCarDetails?.originalPrice,
                resalePrice: updatedCarDetails?.resalePrice
            }
        }
        const result = await carsCollection.updateOne(query, updatedDoc, options)
        res.send(result);
    })

    app.get('/categories', async(req, res) => {
        const query = {};
        const result = await categoriesCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/dashboard/reportedItems', async(req, res)=>{
        const query = {};
        const result = await reportedProductsCollection.find(query).toArray();
        res.send(result);
    })

    app.delete('/dashboard/removeitem', async(req, res) => {
        const id = req.query.id;
        const filter = {_id:ObjectId(id)};
        const result = await reportedProductsCollection.deleteOne(filter);
        console.log(result);
        res.send(result);
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
