const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 3001;
require("dotenv").config();
const cors = require("cors");

// middleware
app.use(express.json());
app.use(cors());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).send({ message: "Unauthorized Access", error: true });
  }
  const token = authorization.split(" ")[1];
 

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Unauthorised Access", error: true });
    }
    req.decoded = decoded;
   
    next();
  });
};
// mongodb server
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.oxnofiz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const productsCollection = client.db("Shopping_Cart").collection("productsDB");
    const usersCollection = client.db("Shopping_Cart").collection("usersDB");
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "2h" });
      res.send({ token });
    });
    // get all users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send({ result, totalUsers: result.length });
    });
    // get all products
    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send({ result, totalProducts: result.length });
    });

    // get Single Product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(filter);
      res.send(result);
    });
    // get product by query email
    app.get("/product", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
    
      const email = req.query?.email;
      if (!email) {
        return res.send([]);
      }
      if (decoded?.email != email) {
        return res.status(401).send({ message: "Unauthorised Access", error: true });
      }
      const result = await productsCollection.find({ email: email }).toArray();
      res.send(result);
    });

    // get categorywise Product
    app.get("/products/category/:category", async (req, res) => {
      const category = req.params?.category;

      let query = {};
      if (category) {
        query = { category: category };
      }
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // add new user
    app.post("/addUser", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });
  } catch (err) {
    console.error(`An error occurred${err}`);
  }
}
run().catch(console.dir);

// root server directory
app.get("/", (req, res) => {
  res.send("simple shopping cart reactJS server is running");
});

// server listeining
app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
