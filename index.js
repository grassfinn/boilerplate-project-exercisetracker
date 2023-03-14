// https://www.youtube.com/watch?v=-fzsjnobti8&ab_channel=K-dev
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
// have to give path
require('dotenv').config({ path: './sample.env' });

// connect to DB
const db = process.env.DB;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
  },
  // removes _v property
  { versionKey: false }
);

const exerciseSchema = new mongoose.Schema(
  {
    username: String,

    uId: String,

    description: String,

    duration: Number,

    date: Date,
  },
  { versionKey: false }
);

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);
// Middleware
app.use(cors());
app.use(express.static('public'));
// need bodyParser to read the form input
// also is attached to the name of the html input name attr
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  const absolutePath = __dirname + '/views/index.html';
  res.sendFile(absolutePath);
});

app.get('/api/users', async (req, res) => {
  const response = await User.find();
  res.send(response);
});

app.post('/api/users', async (req, res) => {
  // Create a new user when the form is submitted
  const username = req.body.username;
  const newUser = new User({ username });
  // for most mongoose things you will need a async/await
  // find a user with the same username input
  const sameName = await User.findOne({ username });
  // if that name exists return this message
  if (sameName) {
    res.json({
      message: 'That name is already taken. Please try another one.',
    });
    return;
  }
  // save into the DB
  await newUser.save();
  // send the new user as json as a response
  // res.json(newUser);
  res.send(newUser);
});

app.get('/api/users/:_id/logs', async (req, res) => {
  // find the id user searching for
  // use params to find
  const userId = req.params['_id'];
  // send a response of the document/data
  const userLog = await Exercise.findById(userId);
  const findUser = await User.findById(userId);
  let { from, to, limit } = req.query;



  const findExerciseLog = await Exercise.find(userLog);
  console.log(findExerciseLog);
  // findExerciseLog = modifiedExerciseLog
  // destructuring a map
  let modifiedExerciseLog = findExerciseLog.map(
    ({ description, duration, date }) => {
      return {
        description,
        duration,
        date: date.toDateString(),
      };
    }
  );

  res.json({
    _id: userId,
    username: findUser.username,
    count: findExerciseLog.length,
    log: modifiedExerciseLog,
  });
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  // turn inputs into reqs
  let { description, duration, date } = req.body;
  const userId = req.body[':_id'];
  // find user by id
  const findUser = await User.findById(userId);

  if (!findUser) {
    res.json({ message: 'No user found, please try again.' });
  }

  if (!date) {
    date = new Date();
  } else {
    // if date is a real date create one with the date obj
    date = new Date(date);
  }
  let formInput = {
    username: findUser.username,
    description,
    duration,
    date: date.toDateString(),
    // _id:
    uId: userId,
  };

  // ?const newExercise = new Exercise(formInput);
  // ?await newExercise.save();
  // or

  await Exercise.create(formInput);

  // send data as json as a response
  res.send(formInput);
  // place data into the DB
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
