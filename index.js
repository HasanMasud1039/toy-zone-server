const express = require('express');
const helmet = require('helmet');
const app = express();

const port = process.env.PORT || 5000;
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fznkpfd.mongodb.net/?retryWrites=true&w=majority`;



// console.log(process.env.DB_PASS, process.env.DB_USER);
//middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'none'"], // Set a default source that disallows everything
//       scriptSrc: ["'self'", "'https://vercel.live'"], // Allow scripts from 'self' and 'https://vercel.live'
//       // Add more directives for other content types if needed (e.g., imgSrc, styleSrc, etc.)
//     },
//   })
// );


app.get('/', (req, res) => {
  res.send('Hello World!')
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //send data to mongodb database
    const toyCollection = client.db('toyDB').collection('toy');
    // console.log(toyCollection);
    app.post('/toys', async (req, res) => {
      const item = req.body;
      console.log(item);

      const result = await toyCollection.insertOne(item);
      res.send(result);
    })
    //delete toy
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    //show data form mongodb 


    app.get('/toys', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get("/toys/:id", async (req, res) => {
      console.log(req.params.id);
      const toys = await toyCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(toys);
    });


    app.get('/category/:category', async (req, res) => {
      console.log(req.params.category);
      const toys = await toyCollection
        .find({
          subCategory: req.params.category,
        }).toArray();
      res.send(toys);
    })
    app.get('/category/:id', async (req, res) => {
      console.log(req.params.id);
      const toys = await toyCollection
        .find({
          category_id: (req.params.id),
        }).toArray();
      res.send(toys);
    })

    app.get("/mytoys/:email", async (req, res) => {
      console.log(req.params.email);
      const toys = await toyCollection
      .find({
        sellerEmail: req.params.email,
      }).toArray();
      res.send(toys);
    });

    //search
    app.get("/getSearchByToyName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection
        .find({
          name: { $regex: searchText, $options: "i" },
        })
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;
