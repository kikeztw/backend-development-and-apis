const express = require('express');
const router = express.Router();
const path = require('path');


const time = (value) =>{
  const givenDate = value;
  let date;
 // check if no date provided
  if (!givenDate) {
    date = new Date();
  } else {
    // check if unix time:
    //    number string multiplied by 1 gives this number, data string gives NaN
    const checkUnix = givenDate * 1;
    date = isNaN(checkUnix) ? new Date(givenDate) : new Date(checkUnix);
  }

  //check if valid format
  if (date == "Invalid Date") {
    return { error: "Invalid Date" };
  } else {
    const unix = date.getTime();
    const utc = date.toUTCString();
    return{ unix, utc };
  }
}

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'time-stamp.html'));
})

router.get('/api/:date?', function(req, res){
  const { date } = req.params;
  res.json(time(date));
}); 

module.exports = router;
