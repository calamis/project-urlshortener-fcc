require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();
const dns = require('dns');
const URL = require('url').URL;

// TODO
// Connect DB here

// Create Person Schema
const urlSchema = new mongoose.Schema({
  orignalURL: { type: String},
  shortenedURL: { type: String},
});
const Model = mongoose.model("URLShoterner", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// URL shortener endpoint
app.post("/api/shorturl", (req, res) => {
  const originalURL = req.body.url;

  let urlRegex = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi
  );

  if (!originalURL.match(urlRegex)) {
    return res.json({ error: "invalid url" });
  } else {
    let shortenedURL = Math.floor(Math.random()*100000).toString();

    // Create new Data and 
    let newURL = new Model({
      orignalURL: originalURL,
      shortenedURL: shortenedURL,
    });

    // Save newURL to DB 
    newURL.save((err, data) => {
      if(err) {
        console.error(err);
      }
    });

    res.json({
      original_url : originalURL,
      short_url : shortenedURL
    });
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
  let short_url = req.params.short_url;

  Model.findOne({shortenedURL: short_url}, (err, foundURL) => {
    if (err) {
      res.json({ error: 'invalid url' })
    } else {
      res.redirect(301, foundURL.orignalURL)
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
