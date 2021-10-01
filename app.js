require('dotenv').config()
const fileUpload = require('express-fileupload');
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const timeStampRouter = require('./routes/time-stamp');
const fileMedatadaMiscroService = require('./routes/file-metadata-microservice');
const urlShortenerMicroservice = require('./routes/url-shortener-microservice');
const requestHeaderParserMicroservice = require('./routes/request-header-parser-microservice');
const exerciseTracker = require('./routes/exercise-tracker');


// Data base connect setup
mongoose.connect(process.env.DATA_BASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors({optionsSuccessStatus: 200}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload({
  createParentPath: true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/time-stamp', timeStampRouter);
app.use('/file-metadata-microservice', fileMedatadaMiscroService);
app.use('/url-shortener-microservice', urlShortenerMicroservice);
app.use('/request-header-parser-microservice', requestHeaderParserMicroservice);
app.use('/exercise-tracker', exerciseTracker);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.mongoose = mongoose;
module.exports = app;
