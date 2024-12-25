const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7g8b9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');

    const blogsCollection = client.db('BlogWebsite').collection('blogs');
    const wishlistCollection = client.db('BlogWebsite').collection('wishlist');

    app.get('/blogs', async (req, res) => {
      const cursor = blogsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);
      res.send(result);
    });

    app.post('/blogs', async (req, res) => {
      const newBlog = req.body;
      const result = await blogsCollection.insertOne(newBlog);
      res.send(result);
    });

    app.post('/wishlist', async (req, res) => {
      const list = req.body;
      const result = await wishlistCollection.insertOne(list);
      res.send(result);
    });

    app.get('/wishlist', async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await wishlistCollection.find(query).toArray();

      for (const application of result) {
        console.log(application.blogId);
        const query1 = { _id: new ObjectId(application.blogId) };
        const blog = await blogsCollection.findOne(query1);

        if (blog) {
          application.title = blog.title;
          application.image = blog.image;
          application.category = blog.category;
          application.short_description = blog.short_description;
        }
      }
      res.send(result);
    });

    app.delete('/wishlist/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('blog');
});

app.listen(port, () => {
  console.log(`blog is waiting: ${port}`);
});
