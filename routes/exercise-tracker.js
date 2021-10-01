const mongoose = require("mongoose");
const express = require('express');
const router = express.Router();
const path = require('path');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  logs: [{ type: Schema.Types.ObjectId, ref: 'Exercises' }],
});

const exercisesSchema = new Schema({
  user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  search_date: { type: Date },
  date: { type: String }
});

const User = mongoose.model('User', userSchema);
const Exercises = mongoose.model('Exercises', exercisesSchema);

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'exercise-tracker.html'));
})

router.post('/api/users', async (req, res, next) => {
  const { username  } = req.body;
  const  newUser = new User({ username });
  try{
    const response = await  newUser.save();
    res.json({
      _id: response._id,
      username
    });
  }catch(error){
    next({ message: error.message })
  }
})

router.get('/api/users', async (req, res, next) => {
  try {
    const response = await User.find();
    res.json(response);
  } catch (error) {
    next({ message: error.message })
  }
}) 

router.post('/api/users/:_id/exercises', async (req, res, next) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const _date = date ? new Date(date).toDateString() : new Date().toDateString();
  const _duration = Number(duration);

  if(!_id){
   next({ message: 'User id no found' });
  }

  let user
  try {
    user  = await User.findById(_id).exec();
  } catch (error) {
    next({ message: error.message });
  }

  if(!user){
    next({ message: 'User no found' });
  }

  const newExercises = new Exercises({
    description,
    duration: _duration,
    search_date: _date,
    date: _date,
    user: user.id,
  })

  try {
    await newExercises.save();
  } catch (error) {
    next({ message: error.message });
  }

  const logs = user.logs || [];
  user.logs = [...logs, newExercises._id];

  try {
    await user.save();
  } catch (error) {
    next({ message: error.message });
  }
  
  res.json({
    description,
    duration: _duration,
    date: _date,
    username: user.username,
    _id: user.id,
  });
}) 

router.get('/api/users/:_id/logs', async (req, res, next) => {
  const { limit, from, to } = req.query;
  const { _id } = req.params;

  let options = {}

  if(limit){
    options = {
      limit: Number(limit), 
    }
  }

  let user;
  try {
   user = await User.findById(_id).exec();
  } catch (error) {
    next({ message: error.message });
  }

  if(!user){
    next({ message: 'User no found' });
  }

  const find = {
    user: user.id,
  }

  if(from && to){
    Object.assign(find, {
      search_date:{
        $gte: new Date(from),
        $lte: new Date(to),
      }
    })
  }

  let logs 
  try {
    logs = await Exercises.find(
      find, 
      null, 
      options
    ).select('-_id').exec();
  } catch (error) {
    next({ message: error.message });
  }

  const data = {
    _id: user._id,
    username: user.username,
    count: logs.length,
    log: logs || [],
  }

  if(from && to){
    Object.assign(data, {
      from: new Date(from).toDateString(),
      to: new Date(to).toDateString(),
    })
  }

  res.json(data)
})  

router.use((error, req, res, next) => {
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || 'Internal Server Error',
    },
  });
});

module.exports = router;
