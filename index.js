// For mongodb DNS error
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// importing necessary modules
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

// initializing express app and dotenv
const app = express()
dotenv.config()

// setting up port and uri from environment variables
const port = process.env.PORT;
const uri = process.env.MONGO_DB_URI;


app.use(cors())
app.use(express.json())

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



// get token from backend 
const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);

// middleware for authentication
const middleware = async (req, res, next) => {
    // receiving token from client side
    const authHeader = req?.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // verify token with jose-cjs
    try {
        const { payload } = await jwtVerify(token, JWKS);
        next();

    } catch (error) {
        return res.status(403).json({ message: "Forbidden" });
    }
};



async function run() {
    try {
        await client.connect();

        const db = client.db("petora");
        const petsCollection = db.collection("pets");
        const usersCollection = db.collection("users");

        app.get('/pets',
            async (req, res) => {
                const result = await petsCollection.find({}).toArray();
                res.json(result);
            }
        );

        app.get('/pets/:id',
            async (req, res) => {
                const { id } = req.params;

                const result = await petsCollection.findOne({ _id: new ObjectId(id) });
                res.json(result);
            }
        );

        app.post('/pets',
            async (req, res) => {
                const petData = req.body;

                const result = await petsCollection.insertOne(petData);
                res.json(result);
            }
        );

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Petora server is running successfully!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})