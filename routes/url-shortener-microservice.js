const express = require('express');
const path = require('path');
const router = express.Router();
const uniqid = require('uniqid'); 
const validUrl = require('valid-url');
const ForerunnerDB = require("forerunnerdb");

// setup database
const fdb = new ForerunnerDB();

const db = fdb.db("FCCCourse");
const collection = db.collection("Urls", {capped: true, size: 20});

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'url-shortener-microservice.html'));
})

// routes here
router.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  if(!validUrl.isWebUri(url)){
    res.json({ error: 'invalid url' });
  }else{
    const _id = uniqid();
    const code = uniqid.time();
    collection.insert([{
      _id,
      url,
      code
    }])
    res.json({ 
      original_url: url,
      short_url: code
    });
  }
})

router.get('/find', (req, res) => {
  const code = req.query.code || '';
  const result = collection.find({
    code:{
      $eeq: code,
    }
  })
  res.json({ success: JSON.stringify(result) });
})

router.get('/api/shorturl/:code?', (req, res) => {
  const code = req.params.code || '';
  const result = collection.find({
    code:{
      $eeq: code,
    }
  })

  if(result?.length){
    const record = result[0];
    const url = record.url;
    res.redirect(url);
  }else{
    res.status(500).json('Url not found')
  }
})


module.exports = router;
