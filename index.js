const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

// middleware

app.use(cors());
app.use(express.json());

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorize access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.a2fs5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const monitorCollection2 = client
      .db("monitor-mania")
      .collection("emailMonitors");
    const usersItemCollection = client
      .db("monitor-mania")
      .collection("usersItem");
    const chartData = client.db("monitor-mania").collection("chart");

    // auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.JWT_SECRET_TOKEN, {
        expiresIn: "2d",
      });
      res.send({ accessToken });
    });

    // load all inventory
    app.get("/inventories", async (req, res) => {
      const query = {};
      const cursor = monitorCollection2.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // load inventory by email
    app.get("/usersItem", verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = usersItemCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
    });
    // load single inventory
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const inventory = await monitorCollection2.findOne(query);
      res.send(inventory);
    });

    // load single user added item

    app.get("/usersItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const inventory = await usersItemCollection.findOne(query);
      res.send(inventory);
    });

    // add an item

    app.post("/usersItem", async (req, res) => {
      const newItem = req.body;
      const result = await usersItemCollection.insertOne(newItem);
      res.send(result);
    });

    // load single user added item

    app.post("/usersItem", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const inventory = await usersItemCollection.findOne(query);
      res.send(inventory);
    });

    // delete item

    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await monitorCollection2.deleteOne(query);
      res.send(result);
    });

    // delete user added item

    app.delete("/usersItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersItemCollection.deleteOne(query);
      res.send(result);
    });

    // update data
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const newItem = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: newItem,
      };
      const result = await monitorCollection2.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // load chart
    app.get("/chart", async (req, res) => {
      const query = {};
      const cursor = chartData.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is ok");
});

app.listen(port, () => {
  console.log("listening ot port", port);
});
