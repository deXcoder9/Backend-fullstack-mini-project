const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();

// middlewares
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.wvuyzyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("miniFullstack");
    const productCollection = database.collection("products");

    // app.get('/products', async(req, res) => {
    // const result = await productCollection.find().toArray()
    // res.send(result);
    // } )

    app.get("/products", async (req, res) => {
      const { brand, category, priceRange, sort, search } = req.query;
      let query = {};
      // const all = req.query;
      // console.log("all i get from client:", all);
      
      // brand name
      if (brand) {
        query.brand_name = { $in: brand.split(",") };
      }
      // category
      if (category) {
        query.category = { $in: category.split(",") };
      }

      //price range
      if (priceRange) {
        if (priceRange === "0-199") {
          query.price = { $gte: 0, $lte: 199 };
        } else if (priceRange === "200-499") {
          query.price = { $gte: 200, $lte: 499 };
        } else if (priceRange === "500-999") {
          query.price = { $gte: 500, $lte: 999 };
        } else if (priceRange === "1000-2999") {
          query.price = { $gte: 1000, $lte: 2999 };
        }
      }

      //for price sorting
      let sorting = {};
      if (sort) {
        if (sort === "low-to-high") {
          sorting.price = 1;
        } else if (sort === "high-to-low") {
          sorting.price = -1;
        } else if (sort === "newest-first") {
          sorting.date_time = -1;
        } else if (sort === "oldest-first") {
          sorting.date_time = 1;
        }
      }

       //  search
      if (search) {
          query.product_name = { $regex: search, $options: 'i' }
      }

      const result = await productCollection
        .find(query)
        .sort(sorting)
        .toArray();
      // console.log(result);
      console.log("Query:", query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("the project is running.....");
});

app.listen(port, () => {
  console.log(`the port is running in ${port}`);
});
