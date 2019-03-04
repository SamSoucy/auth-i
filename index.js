const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require("bcryptjs");

const db = require('./data/dbConfig.js');

const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

//************Creates a user*******************

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
  


const port = process.env.PORT || 6000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));