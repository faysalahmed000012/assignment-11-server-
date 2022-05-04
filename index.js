const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.a2fs5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const monitorCollection = client.db("monitor-mania").collection("monitors");
    const chartData = client.db("monitor-mania").collection("chart");

    // load all inventory
    app.get("/inventories", async (req, res) => {
      const query = {};
      const cursor = monitorCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // load single inventory
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const inventory = await monitorCollection.findOne(query);
      res.send(inventory);
    });

    // add an item

    app.post("/inventories", async (req, res) => {
      const newItem = req.body;
      const result = await monitorCollection.insertOne(newItem);
      res.send(result);
    });

    // delete an element

    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.body;
      const query = { _id: ObjectId(id) };
      const result = await monitorCollection.deleteOne(query);
      res.send(result);
    });
    // updata data
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const newItem = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: newItem,
      };
      const result = await monitorCollection.updateOne(
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
