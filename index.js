const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5001;
const { ObjectId } = require('mongodb');

// middleware

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://<username>:<password>@cluster0.tqyfr7x.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqyfr7x.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("Rcgzhs").collection("users");
    const studentCollection = client.db("Rcgzhs").collection("students");
    const resultCollection = client.db("Rcgzhs").collection("results");
    const NewsCollection = client.db("Rcgzhs").collection("news");

    // Insert User in this case 

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // DashBoard Control ...............................

    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })

    app.get('/users/teacher/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let Teacher = false;
      if (user) {
        Teacher = user?.role === 'teacher';
      }

      res.send({ Teacher });
    })

    // Show all user in this get method

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // user update 

    app.patch('/users/role/:id', async (req, res) => {
      const id = req.params.id;
      const { role } = req.body;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: role,
        },
      };

      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });


    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    // added student information in this part

    app.post('/students', async (req, res) => {
      const students = req.body;
      const result = await studentCollection.insertOne(students);
      res.send(result);
    })

    app.get('/students', async (req, res) => {
      const result = await studentCollection.find().toArray();
      res.send(result);
    })

    app.delete('/students/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await studentCollection.deleteOne(query);
      res.send(result);
    })

    // Update student information

    app.get('/students/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await studentCollection.findOne(query);
      res.send(result)

    })

    // Assuming you have already set up Express and MongoDB connection

    app.put('/students/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body; // Contains updated student information

      try {
        const result = await studentCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
        if (result.modifiedCount > 0) {
          res.status(200).send("Student information updated successfully");
        } else {
          res.status(404).send("Student not found");
        }
      } catch (error) {
        console.error("Error updating student information:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // result related code 

    app.post('/results', async (req, res) => {
      const results = req.body;
      const result = await resultCollection.insertOne(results);
      res.send(result);
      console.log(result)
    })

    app.get('/results', async (req, res) => {
      const result = await resultCollection.find().toArray();
      res.send(result);
    })


    // news management

    app.post('/news', async (req, res) => {
      const news = req.body;
      const result = await NewsCollection.insertOne(news);
      res.send(result);
      console.log(result)
    })

    app.get('/news', async (req, res) => {
      const result = await NewsCollection.find().toArray();
      res.send(result);
    })

    app.delete('/news/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await NewsCollection.deleteOne(query);
      res.send(result);
    })

    // Update news information

    app.get('/news/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await NewsCollection.findOne(query);
      res.send(result)

    })


    app.put('/news/:id', async (req, res) => {
      const id = req.params.id;
      const updatedNewsData = req.body; // Contains updated student information

      try {
        const result = await NewsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedNewsData });
        if (result.modifiedCount > 0) {
          res.status(200).send("News information updated successfully");
        } else {
          res.status(404).send("News not found");
        }
      } catch (error) {
        console.error("Error updating News information:", error);
        res.status(500).send("Internal Server Error");
      }
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


app.get('/', (req, res) => {
  res.send('Rcgzhs server is running')
})

app.listen(port, () => {
  console.log(`Rowmari C. G Zaman is running in port ${port}`)
})