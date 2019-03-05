const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require("bcryptjs");
const session = require("express-session");

const db = require('./data/dbConfig.js');

const Users = require('./users/users-model.js');

const server = express();

const sessionConfig = {
  name: "huskey",
  secret: "keep it secret, keep it safe!",
  cookie: {
    maxAge: 1000 * 60 * 60, 
    secure: false, 
  },
  httpOnly: true, 
  resave: false,
  saveUninitialized: false, 
}


server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

//************Register a user*******************

server.post('/api/register', (req, res) => {
    let user = req.body;
  
    const hash = bcrypt.hashSync(user.password, 12)
  
    user.password = hash
  
    Users.add(user)
      .then(saved => {
        res.status(201).json(saved);
      })
      .catch(error => {
        res.status(500).json(error);
      });
});

//************Login a user*******************

server.post('/api/login', (req, res) => {
    let { username, password } = req.body;
  
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          req.session.username = user.username;
          res.status(200).json({ message: `Welcome ${user.username}! You are now logged in` });
        } else {
          res.status(401).json({ message: "You shall not pass!" });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
});

//************User logged in to see list of users *******************

function restricted(req, res, next) {
  if (req.session && req.session.username) {
    next();
  } else {
        res.status(401).json({message:"you shall not pass!"})
    }
}
server.get('/api/users', restricted, (req, res) => {
    Users.find()
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err));
})
  

  


const port = process.env.PORT || 6000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));