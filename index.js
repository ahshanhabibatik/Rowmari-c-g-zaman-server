const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5001;
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');



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
    const AdmitCardCollection = client.db("Rcgzhs").collection("admitCard");
    const PublicAdmitCollection = client.db("Rcgzhs").collection("publicAdmit");
    const UnPublicAdmitCollection = client.db("Rcgzhs").collection("unPublicAdmit");
    const linksCollection = client.db("Rcgzhs").collection("Links");
    const sscCollection = client.db("Rcgzhs").collection("sscResult");


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


    // student dashboard

    app.get('/users/role/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let student = false;
      if (user) {
        student = user?.role === 'student';
      }
      res.send({ student }); 
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
      const updatedData = req.body;

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
      console.log(query)
      const result = await resultCollection.deleteOne(query);
      console.log(result)
      res.send(result);
    })


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


    app.post('/results/unpublish', async (req, res) => {
      try {

        await UnpublishedResultCollection.deleteMany();

        const publishedResults = await publishedResultCollection.find().toArray();

        const insertedResults = await UnpublishedResultCollection.insertMany(publishedResults);


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
      const updatedNewsData = req.body;

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


    // AdmitCard Generate code 

    app.post('/admitPost', async (req, res) => {
      const admit = req.body;
      const result = await AdmitCardCollection.insertOne(admit);
      res.send(result);
    })

    app.get('/admitPost', async (req, res) => {
      const result = await AdmitCardCollection.find().toArray();
      res.send(result);
    })

    app.delete('/admitPost/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      console.log(query)
      const result = await AdmitCardCollection.deleteOne(query);
      console.log(result)
      res.send(result);
    })

    // update admit card

    app.put('/admitPost/:id', async (req, res) => {
      const id = req.params.id;
      const updatedAdmitData = req.body;

      try {
        const result = await AdmitCardCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedAdmitData });
        if (result.modifiedCount > 0) {
          res.status(200).send("routine information updated successfully");
        } else {
          res.status(404).send("routine not found");
        }
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });


    // get update admit info
    app.get('/admitPost/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await AdmitCardCollection.findOne(query);
      res.send(result)

    })

    app.post('/Admit/publish', async (req, res) => {
      try {
        // Retrieve all results from the original database
        const allAdmit = await AdmitCardCollection.find().toArray();

        // Insert all results into the new database
        const publishedResults = await PublicAdmitCollection.insertMany(allAdmit);
        res.send("admit published successfully.");
      } catch (error) {
        console.error("Error publishing results:", error);
        res.status(500).send("Error publishing results.");
      }
    });


    app.post('/Admit/unpublish', async (req, res) => {
      try {

        await UnPublicAdmitCollection.deleteMany();

        const publishedAdmit = await PublicAdmitCollection.find().toArray();

        const insertedResults = await UnPublicAdmitCollection.insertMany(publishedAdmit);


        const deleteAdmit = await PublicAdmitCollection.deleteMany();
        res.send({ deletedCount: deleteAdmit.deletedCount, insertedCount: insertedResults.insertedCount });
      } catch (error) {
        res.status(500).send("Error unpublishing admit.");
      }
    });


    app.get('/Admit/publish', async (req, res) => {
      const result = await PublicAdmitCollection.find().toArray();
      res.send(result);
    })


    // Links related code 

    app.get('/links', async (req, res) => {
      const result = await linksCollection.find().toArray();
      res.send(result);
    })




    // ssc result
    app.post('/sscResult', async (req, res) => {
      const ssc = req.body;
      const result = await sscCollection.insertOne(ssc);
      res.send(result);
    })

    app.get('/sscResult', async (req, res) => {
      const result = await sscCollection.find().toArray();
      res.send(result);
    })


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