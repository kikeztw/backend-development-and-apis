const express = require('express');
const router = express.Router();
const path = require('path');
const os = require('os');

function getCallerIP(request) {
  var ip = request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.connection.socket.remoteAddress;
  ip = ip.split(',')[0];
  ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
  return ip;
}

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'request-header-parser-microservice.html'));
})

router.get("/api/whoami", function (req, res) {
  const headers = req.headers;
  const ipaddress = getCallerIP(req)?.[0];
  const language = headers['accept-language'];
  const software = headers['user-agent'];
  res.json({
    ipaddress,
    language,
    software,
  });
});

module.exports = router;
