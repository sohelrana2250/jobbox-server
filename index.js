const express = require('express')
const app = express()
const port = process.env.PORT || 5014;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();



//middlewere

app.use(cors());
app.use(express.json());


//username: jobBoxprotal
//password: pNwDZoqpkfDiNSWS




// console.log(process.env.USER_NAME);
// console.log(process.env.USER_PASSWORD);

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.wqhd5vt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


async function run() {

    const employeCollection = client.db("JobBox").collection("jobUser");
    const jobCollection = client.db("JobBox").collection("job");
    try {
        app.get('/', (req, res) => {
            res.send('Hello World!')
        });


        app.post('/user', async (req, res) => {

            const data = req.body;

            const result = await employeCollection.insertOne(data);
            // console.log(result);
            res.send(result);
        })

        app.get('/employerUser/:email', async (req, res) => {

            const email = req.params.email;
            const query = { email };
            const result = await employeCollection.findOne(query);
            res.send(result);


        })

        app.post('/job', async (req, res) => {

            const job = req.body;
            const result = await jobCollection.insertOne(job);
            res.send(result);

        })

        app.get('/job', async (req, res) => {

            const query = {};
            const result = await jobCollection.find().toArray();
            res.send({ status: true, data: result });
        })

        app.get('/job-details/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobCollection.findOne(query);
            // console.log(result);
            res.send({ status: true, data: result });


        })


        app.patch("/apply", async (req, res) => {
            const userId = req.body.userId;
            const jobId = req.body.jobId;
            const email = req.body.email;

            console.log(userId);
            console.log(jobId);
            console.log(email);

            const filter = { _id: new ObjectId(jobId) };
            const updateDoc = {
                $push: { applicants: { id: new ObjectId(userId), email } },
            };

            const result = await jobCollection.updateOne(filter, updateDoc);

            if (result.acknowledged) {
                return res.send({ status: true, data: result });
            }

            res.send({ status: false });
        });


        app.get("/applied-jobs/:email", async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = { applicants: { $elemMatch: { email: email } } };
            const cursor = jobCollection.find(query).project({ applicants: 0 });
            const result = await cursor.toArray();

            res.send({ status: true, data: result });
        });


        app.patch("/query", async (req, res) => {
            const userId = req.body.userId;
            const jobId = req.body.jobId;
            const email = req.body.email;
            const question = req.body.question;


            const filter = { _id: new ObjectId(jobId) };
            const updateDoc = {
                $push: {
                    queries: {
                        id: new ObjectId(userId),
                        email,
                        question: question,
                        reply: [],
                    },
                },
            };

            const result = await jobCollection.updateOne(filter, updateDoc);
            console.log(result);

            if (result?.acknowledged) {
                return res.send({ status: true, data: result });
            }

            res.send({ status: false });
        });



        app.patch("/reply", async (req, res) => {
            const userId = req.body.userId;
            const reply = req.body.reply;

            const filter = { "queries.id": new ObjectId(userId) };

            const updateDoc = {
                $push: {
                    "queries.$[user].reply": reply,
                },
            };
            const arrayFilter = {
                arrayFilters: [{ "user.id": new ObjectId(userId) }],
            };

            const result = await jobCollection.updateOne(
                filter,
                updateDoc,
                arrayFilter
            );
            console.log(result);
            if (result.acknowledged) {
                return res.send({ status: true, data: result });
            }

            res.send({ status: false });
        });




    }

    finally {

    }
}

run().catch((error) => {
    console.log(error.messsage);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})