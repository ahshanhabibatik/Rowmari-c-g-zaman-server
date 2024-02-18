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
    const totalStudentCollection = client.db("Rcgzhs").collection("totalStudent");
    const publishedResultCollection = client.db("Rcgzhs").collection("allResults");
    const UnpublishedResultCollection = client.db("Rcgzhs").collection("UnPublished");

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

    // delete result 

    app.delete('/results/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await resultCollection.deleteOne(query);
      res.send(result);
    })


    // public and unpublic result

    // Endpoint for publishing results
    app.post('/results/publish', async (req, res) => {
      try {
        // Retrieve all results from the original database
        const allResults = await resultCollection.find().toArray();

        // Insert all results into the new database
        const publishedResults = await publishedResultCollection.insertMany(allResults);
        res.send("Results published successfully.");
      } catch (error) {
        console.error("Error publishing results:", error);
        res.status(500).send("Error publishing results.");
      }
    });


 
    // Endpoint for unpublishing results
    app.post('/results/unpublish', async (req, res) => {
      try {
        // Delete all documents in the UnpublishedResultCollection
        await UnpublishedResultCollection.deleteMany();
    
        // Retrieve all published results
        const publishedResults = await publishedResultCollection.find().toArray();
    
        // Insert all published results into the UnpublishedResultCollection
        const insertedResults = await UnpublishedResultCollection.insertMany(publishedResults);
    
        // Delete all published results from the publishedResultCollection
        const deleteResult = await publishedResultCollection.deleteMany();
        res.send({ deletedCount: deleteResult.deletedCount, insertedCount: insertedResults.insertedCount });
      } catch (error) {
        res.status(500).send("Error unpublishing results.");
      }
    });
    




    app.get('/results/publish', async (req, res) => {
      const result = await publishedResultCollection.find().toArray();
      res.send(result);
    })


    // news management

    app.post('/news', async (req, res) => {
      const news = req.body;
      const result = await NewsCollection.insertOne(news);
      res.send(result);

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
        res.status(500).send("Internal Server Error");
      }
    });

    // Total Student Collection

    app.get('/totalStudent', async (req, res) => {
      const result = await totalStudentCollection.find().toArray();
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


app.get('/', (req, res) => {
  res.send('Rcgzhs server is running')
})

app.listen(port, () => {
  console.log(`Rowmari C. G Zaman is running in port ${port}`)
})