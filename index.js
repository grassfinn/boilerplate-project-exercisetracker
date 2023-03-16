const mySecret = process.env['DB'];
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
    },
  },
  // removes _v property
  { versionKey: false }
);

const exerciseSchema = new mongoose.Schema(
  {
    uId: String,
    description: String,
    duration: Number,
    // needs to be because it a interger to be compared upon
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

// !users

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
  // if (sameName) {
  //   res.json({
  //     message: 'That name is already taken. Please try another one.',
  //   });
  //   return;
  // }
  // save into the DB
  await newUser.save();
  // send the new user as json as a response
  // res.json(newUser);
  res.send(newUser);
});

// ? POSTS

app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id;
  let { description, duration, date } = req.body;

  if (!date) {
    date = new Date().toDateString();
  } else {
    date = new Date(date).toDateString();
  }

  let exerciseObj = {
    uId: userId,
    description: req.body.description,
    duration: parseInt(duration),
    date,
  };
  User.findById(userId).then((user) => {
    let newExercise = new Exercise(exerciseObj);
    newExercise.save();

    res.json({
      _id: user._id,
      username: user.username,
      description: newExercise.description,
      duration: parseInt(newExercise.duration),
      date: newExercise.date.toDateString(),
    });
    console.log(user);
  });
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const uId = req.params._id;
  const findUser = await User.findById(uId);
  let { from, to, limit } = req.query;
  if (!limit) {
    limit = 100;
  }
  limit = parseInt(limit);

  let dateFilter = { uId };

  // set date to a yyyy-mm-dd
  // .toISOString().split("T")[0]

  if (from !== undefined && to === undefined) {
    dateFilter.date = { $gte: new Date(from) };
  } else if (to !== undefined && from === undefined) {
    dateFilter.date = { $gte: new Date(to) };
  } else if (from !== undefined && to !== undefined) {
    dateFilter.date = { $gte: new Date(from), $lte: new Date(to) };
  }

  //   if (from){
  //     dateFilter.date['$gte'] = new Date(from)
  //   }
  //   if (to){
  //     dateFilter.date['$lte'] = new Date(to)
  //   }
  // if (from || to) {
  //   filter.dateFilter = dateFilter;
  // }

  // $'gte' greaterThanEqual '$lte' lessThanEqual

  responseObj = {
    _id: uId,
    username: findUser.username,
  };
  // console.log({queryObj})
  const findExercises = await Exercise.find(dateFilter).limit(limit).exec();
  const exercises = findExercises;
  responseObj.log = exercises.map((exercise) => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    };
  });
  responseObj.count = findExercises.length;

  console.log(responseObj, dateFilter);
  res.json(responseObj);

  // console.log(findLogs)
});

//  ! listener

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
