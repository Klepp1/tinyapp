const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;
const cookieParser = require('cookie-parser');
const findKeyByValue = require('./test');

function getKeyByValue(object, value) {
  for (const prop of Object.values(object)) {
    for (const prop2 in prop) {
      if (prop[prop2] === value) {
        return true;
      }
    }
  }
  return false;
};

const generateRandomString = (length, chars) => {
  let result = '';
  for (var i = length; i > 0; --i) {
     result += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return result;
};
const rString = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/login', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']]};
  res.render('urls_login', templateVars);
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] }
  res.render('urls_index', templateVars);
  console.log(users)
});

app.get('/urls/new', (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']] }
  res.render('urls_new', templateVars);
});

app.get('/urls/register', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_register', templateVars);
});

app.post('/urls', (req, res) => {
  urlDatabase[rString] = req.body.longURL;
  res.redirect(`/urls/${rString}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`], links: urlDatabase, user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
urlDatabase[req.params.shortURL] = req.body['New URL'];
res.redirect(req.params.shortURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[`${req.params.shortURL}`]
  res.redirect('http://localhost:8080/urls')
});

app.post('/urls/login/new', (req, res) => {
  if (!getKeyByValue(users, req.body.email)) {
      res.status(403).send('Invalid Email or password!');
    } else if (getKeyByValue(users, req.body.email)) {
      let id = findKeyByValue(users, req.body.email)
      if (users[id]['password'] === req.body.password) {
        res.cookie('user_id', id);
        res.redirect('/urls')
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(302, '/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[`${req.params.shortURL}`];
  res.redirect(longURL);
});

app.post('/urls/register/newUser', (req, res) => {
  const random = generateRandomString(11, '1234567890')
  if (!req.body.email || !req.body.password) {
    res.send('bad Fields')
  } else if (getKeyByValue(users, req.body.email)){
    res.status(400).send('Account found with this email!');
  } else {
  users[random] = { 
    id: random, 
    email: req.body.email, 
    password: req.body.password
  }
  res.cookie('user_id', Object.keys(users)[Object.keys(users).length-1] )
  res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});