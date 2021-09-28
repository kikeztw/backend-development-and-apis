const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'file-metadata-microservice.html'));
})

router.post('/api/fileanalyse', (req, res) => {
  try {
    if(!req.files) {
        res.send({
            status: false,
            message: 'No file uploaded'
        });
    } else {
        //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
        const file = req.files.upfile;
        //send response
        res.send({
            name: Array.isArray(file) ? file[0].name : file.name,
            type: Array.isArray(file) ? file[0].mimetype : file.mimetype,
            size: Array.isArray(file) ? file[0].size : file.size,
        });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;
