const express = require("express");
const fs = require("fs");
const mydb = require("./db.json");
const app = express();
const bodyParser = require('body-parser');
const jsfy = JSON.stringify;
const df = require('./df.js');
const webpush = require('web-push');
const cors = require('cors');
const socketio = require('socket.io');

app.use(cors());

// webpush.setVapidDetails(
//   "mailto:test@test.com",
//   process.env.publicNetlify,
//   process.env.privateNetlify
// );

webpush.setVapidDetails(
  "mailto:test@test.com",
  process.env.publicKey,
  process.env.privateKey
);

function startFunc() {
  console.log("Started");
  setInterval(
    () => {
      fs.readFile('./db.json', (err, data) => {
        if (err) throw err;
        if (JSON.parse(data) !== mydb) {
          fs.writeFile('./db.json', jsfy(mydb), (err) => {if(err) throw err;})
        }
      });
    },
    1000
  );
}

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send(jsfy({message: "stop DDoS-ing AAAAA"}));
})

app.get('/test', (req, res) => {
  mydb.test = "ok";
  res.send("hi")
})

app.delete('/api/auth/del', (req, res) => {
  const pl = {name: req.body.username, token: req.body.token};
  if (mydb.hasOwnProperty(pl.name)) {
    if (mydb[pl.name].token === pl.token) {
      if (mydb[pl.name].token === "NaN") {
        res.send(jsfy({username: ["This user is logged off."]}))
        return;
      }
      delete mydb[pl.name]
      res.send(jsfy({message: ["User successfully deleted."]}))
    } else {
      res.send(jsfy({username: ["Unmatching Token"]}))
    }
  } else {
    res.send(jsfy({username: ["Invalid user"]}));
  }
  try {
    res.send(jsfy({username: ["Something went wrong. Try again in a few seconds."]}));
  } catch {
    return;
  }
})

app.post('/api/auth/logout', (req, res) => {
  const pl = {name: req.body.username, token: req.body.token};
  if (mydb.hasOwnProperty(pl.name)) {
    if (mydb[pl.name].token === pl.token) {
      if (mydb[pl.name].token === "NaN") {
        res.send(jsfy({username: ["This user already logged off."]}))
        return;
      }
      mydb[pl.name].token = "NaN"
      res.send(jsfy({message: ["Token cleared"]}))
    } else {
      res.send(jsfy({username: ["Unmatching Token"]}))
    }
  } else {
    res.send(jsfy({username: ["Invalid user"]}));
  }
  try {
    res.send(jsfy({username: ["Something went wrong. Try again in a few seconds."]}));
  } catch {
    return;
  }
})

app.post('/api/auth/login', (req, res) => {
  const pl = {name: req.body.username, password: req.body.password};
  if (mydb.hasOwnProperty(pl.name)) {
    if (pl.password === mydb[pl.name].password) {
      const token = String(Math.random()*(10**17))
      mydb[pl.name].token = token;
      res.send(jsfy({
        user: {
          email: mydb[pl.name].email,
          username: mydb[pl.name].username,
          id: Object.keys(mydb).indexOf(pl.name)
        },
        token: token
      }));
    } else {
      res.send(jsfy({username: ["Invalid password"]}));
    }
  } else {
    res.send(jsfy({username: ["Invalid Username"]}));
  }
  try {
    res.send(jsfy({username: ["Something went wrong. Try again in a few seconds."]}));
  } catch {
    return;
  }
})

app.post('/api/auth/register', (req, res) => {
  const pl = {name: req.body.username, password: req.body.password, email: req.body.email};
  if (mydb.hasOwnProperty(pl.name)) {
    res.send(jsfy({username: ["Username Taken"]}));
  } else {
    const token = String(Math.random()*(10**17))
    mydb[pl.name] = {
      password: pl.password,
      email: pl.email,
      token: token
    }
    res.send(jsfy({
      user: {
        email: mydb[pl.name].email,
        username: mydb[pl.name].username,
        id: Object.keys(mydb).indexOf(pl.name)
      },
      token: token
    }))
  }
  try {
    res.send(jsfy({username: ["Something went wrong. Try again in a few seconds."]}));
  } catch {
    return;
  }
})

app.post("/push/subscribe", (req, res) => {
  const subscription = req.body.subscription;
  console.log(req.body);
  res.status(201).json({});

  const payload = JSON.stringify({ title: req.body.title || "UNTITLED REMINDER", description: req.body.description || "NULL", icon: "https://previews.123rf.com/images/etoileark/etoileark1701/etoileark170101119/69812951-cute-cartoon-doctor-with-apple-great-for-health-life-concept.jpg" });

  setTimeout(function() {
    webpush
      .sendNotification(subscription, payload)
      .catch(err => console.error(err));
  }, req.body.delay*1000);
});

const server = app.listen(5000, startFunc);

const io = socketio(server);

io.on('connection', socket => {
  // ok
});
