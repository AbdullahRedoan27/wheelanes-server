const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

function run() {
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zpaqsgt.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  const usersCollection = client.db("4wheelanes").collection("users");
  const carsCollection = client.db("4wheelanes").collection("cars");
  const categoriesCollection = client
    .db("4wheelanes")
    .collection("carCategories");
  const reportedProductsCollection = client
    .db("4wheelanes")
    .collection("reportedProducts");
  const ordersCollection = client.db("4wheelanes").collection("orders");

//   const verifyAdmin = async (req, res, next) => {
//     verifyJWT();
//     const decodedEmail = req.decoded.email;
//     const query = { email: decodedEmail };
//     const user = await usersCollection.findOne(query);

//     if (user?.role !== "Admin") {
//       return res.status(403).send({ message: "forbidden access" });
//     }
//     next();
//   };

  try {
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "2h",
        });
        return res.send({ wheelanesToken: token });
      }
      res.status(403).send({ wheelanesToken: "" });
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "Admin" });
    });

    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "Seller" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = await usersCollection.findOne(query);
      res.send(cursor);
    });

    app.delete("/deleteuser", verifyJWT, async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/makeadmin", verifyJWT, async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      updatedDoc = {
        $set: {
          role: "Admin",
        },
      };
      const result = await usersCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.post("/dashboard/addOrder", async (req, res) => {
      const order = req.body;
      delete order._id;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    app.get("/order", async (req, res) => {
      const id = req.query.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.send(result);
    });

    app.get("/dashboard/myorders", verifyJWT, async (req, res) => {
        const email = req.query.email;
        const decodedEmail = req.decoded.email;
        if(decodedEmail !== email){
            return res.status(403).send('forbidden access')
        }
      const query = { buyerEmail: email };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/dashboard/deleteorder/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/alluser", verifyJWT, async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/allseller", verifyJWT, async (req, res) => {
      const query = { role: "Seller" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/allbuyer", verifyJWT, async (req, res) => {
      const query = { role: "Buyer/User" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/mybuyers", verifyJWT, async (req, res) => {
        
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
        if(decodedEmail !== email){
            return res.status(403).send('forbidden access')
        }
      const query = { sellerEmail: email };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/allProducts", async (req, res) => {
      const query = {};
      const result = await carsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/products/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category, status: "Available" };
      const result = await carsCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    app.post("/reportProduct", async (req, res) => {
      const product = req.body;
      const result = await reportedProductsCollection.insertOne(product);
      res.send(result);
    });

    app.post("/sellCar", verifyJWT, async (req, res) => {
      const car = req.body;
      const result = await carsCollection.insertOne(car);
      res.send(result);
    });

    app.get("/dashboard/myProducts", verifyJWT, async (req, res) => {

      const email = req.query.email;
      const decodedEmail = req.decoded.email;
        if(decodedEmail !== email){
            return res.status(403).send('forbidden access')
        }
      const query = { sellerEmail: email };
      const result = await carsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/dashboard/productDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    app.put("/changeStatus", verifyJWT, async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "Sold",
        },
      };
      const result = await carsCollection.updateOne(query, updatedDoc, options);
      res.send(result);
    });

    app.patch("/advertiseproduct/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          advertise: true,
        },
      };
      const result = await carsCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.get("/advertisedProducts", async (req, res) => {
      const query = {
        advertise: true,
        status: "Available",
      };
      const result = await carsCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/deleteProduct",verifyJWT, async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/dashboard/productDetails/editProduct/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    app.put("/updateCarDetails", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const updatedCarDetails = req.body;
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          carName: updatedCarDetails?.carName,
          category: updatedCarDetails?.category,
          image: updatedCarDetails?.image,
          carDetails: updatedCarDetails?.carDetails,
          location: updatedCarDetails?.location,
          usingPeriod: updatedCarDetails?.usingPeriod,
          quality: updatedCarDetails?.quality,
          originalPrice: updatedCarDetails?.originalPrice,
          resalePrice: updatedCarDetails?.resalePrice,
          sellerVerified: updatedCarDetails.sellerVerified,
        },
      };
      const result = await carsCollection.updateOne(query, updatedDoc, options);
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/dashboard/reportedItems", verifyJWT, async (req, res) => {
      const query = {};
      const result = await reportedProductsCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/verify", verifyJWT, async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          verified: true,
        },
      };
      const result = await usersCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });
  } catch {}
}
run();

app.get("/", (req, res) => {
  res.send("wheelanes server running");
});

app.listen(port, () => {
  console.log(`wheelanes server running on ${port}`);
});
