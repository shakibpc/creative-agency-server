const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j05gt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const port = 5000;

app.get('/', (req, res) => {
res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("creativeAgency").collection("orderServices");
  const doctorsCollection = client.db("creativeAgency").collection("doctors");
  const reviewCollection = client.db("creativeAgency").collection("addReview");
  const newServiceCollection = client.db("creativeAgency").collection("addService");


 
app.post('/orderService', (req, res) => {
  const service = req.body;
  serviceCollection.insertOne(service)
      .then(result => {
          res.send(result.insertedCount > 0)
        })
})

app.post('/doctors', (req, res) => {
  const service = req.body;
  doctorsCollection.insertOne(service)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
})

app.post('/review', (req, res) => {
  const file = req.files.file;
  const name = req.body.name;
  const description = req.body.description;

    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
  };

  reviewCollection.insertOne({name, description, image})
    .then(result => {
     
        res.send(result.insertedCount > 0)
  })

})

app.post('/addService', (req, res) => {
  const file = req.files.file;
  const name = req.body.name;
  const description = req.body.description;
  const newImg = file.data;
  const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
  };

    newServiceCollection.insertOne({name, description, image})
    .then(result => {
        res.send(result.insertedCount > 0)
  })
})

app.post('/isAdmin',(req, res) =>{
  const email = req.body.email;
  doctorsCollection.find({ email: email })
  .toArray((err, doctors) =>{
    res.send(doctors.length > 0);
  })
})

app.get('/showService', (req, res) => {
  serviceCollection.find({email: req.query.email})
  .toArray((err, documents) => {
    res.send(documents);
   })
  })

  app.get('/showServiceAll', (req, res) => {
    serviceCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
     })
    })

    app.get('/showAddService', (req, res) => {
      newServiceCollection.find({}).limit(6)
      .toArray((err, documents) => {
        res.send(documents);
       })
      })

      app.get('/showReview', (req, res) => {
        reviewCollection.find({}).limit(6)
        .toArray((err, documents) => {
          res.send(documents);
         })
        })

});

app.listen(process.env.PORT || port)