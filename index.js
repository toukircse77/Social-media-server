const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middlewares
app.use(cors())
app.use(express.json())

// Database Connection ${process.env.DB_USER} ${process.env.DB_PASS} process.env.ACCESS_TOKEN_SECRET
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p9ygaby.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
  try {
    
    const usersCollection = client.db('SocialMediaApp').collection('Users')
    const postsCollection = client.db('SocialMediaApp').collection('Posts')
    

     //save user email and generate jwt
     app.put('/user/:email', async (req, res) =>{
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      console.log(result)
      
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1d' })
      console.log(token)
      res.send({ result, token });

     })

    //  post data on database 
    app.post('/posts', async (req, res) =>{
      const posts = req.body; 
      const result = await postsCollection.insertOne(posts);
      console.log(result);
      res.send(result);
  })

  // get all post data from database 
  app.get('/Posts', async (req, res) => {
    const quary = {};
    const cursor = postsCollection.find(quary).limit(3);
    const posts = await cursor.toArray();
    res.send(posts)
})
     


   
  }
   finally {
  }
}

run().catch(err => console.error(err))

app.get('/', (req, res) => {
  res.send('Social media Server is running...')
})

app.listen(port, () => {
  console.log(`Server is running...on ${port}`)
})
