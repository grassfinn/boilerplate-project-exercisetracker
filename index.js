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

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);

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
 const response = await User.find()
 res.send(response)

});

app.post('/api/users', async (req, res) => {
  // Create a new user when the form is submitted
  const username = req.body.username;
  const newUser = new User({ username });
  // save into the DB
  await newUser.save();
  // send the new user as json as a response
  res.json(newUser);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  // turn inputs into reqs
  const userId = req.body[':_id'];
  const description = req.body.description;
  const duration = req.body.duration;
  const userDate = req.body.date;
  // place data into the DB
  // send data as json as a response
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
