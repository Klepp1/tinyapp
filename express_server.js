const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;
const cookieSession = require('cookie-session');
const findKeyByValue = require('./test');
const bcrypt = require('bcryptjs');

const getKeyByValue = (object, value) => {
  for (const prop of Object.values(object)) {
    for (const prop2 in prop) {
      if (prop[prop2] === value) {
        return true;
      }
    }
  }
  return false;
};

const urlsForUser = (id) => {
let userURLS = {}
  for (const prop in urlDatabase) {
    if (urlDatabase[prop].userID === id) {
      userURLS[prop] = urlDatabase[prop];
    }
  }
  return userURLS;
};

const generateRandomString = (length, chars) => {
  let result = '';
  for (let i = length; i > 0; --i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return result;
};

const rStringg = generateRandomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'user_id',
  keys: [rStringg, rStringg, rStringg, rStringg, rStringg],
}));


const urlDatabase = {
  
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
  const templateVars = { user: users[req.session.user_id]};
  res.render('urls_login', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id] };
  res.render('urls_index', templateVars);
  console.log(users);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {user: users[req.session.user_id] };
  if (!users[req.session.user_id]) {
    res.redirect('/urls/login');
  } else {
  res.render('urls_new', templateVars);
  }
});

app.get('/urls/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_register', templateVars);
});
app.post('/urls', (req, res) => {
  if (!users[req.session.user_id]['id']) {
    res.status(403).send('You must login to create a TinyURL')
  }
  const rString = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[rString] = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id]['id']
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${rString}`);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send('This is not your URL!');
  }
  if (urlDatabase[req.params.shortURL]['id'] === req.session.user_id['id']) {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`]['longURL'], links: urlDatabase, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
  } 
});

app.post('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]['id'] === req.session.user_id['id']) {
  urlDatabase[req.params.shortURL]['longURL'] = req.body['New URL'];
  res.redirect(req.params.shortURL);
  } else {
    res.status(403).send('This is not your URL!');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send('This is not your URL!');
  } 
  if (urlDatabase[req.params.shortURL]['id'] === req.session.user_id['id']) {
    delete urlDatabase[`${req.params.shortURL}`];
    res.redirect('http://localhost:8080/urls');
  }
});

app.post('/urls/login/new', (req, res) => {
  let id = findKeyByValue(users, req.body.email);
  if (!getKeyByValue(users, req.body.email) || !bcrypt.compareSync(req.body.password, users[id]['password'])) {
    res.status(403).send('Invalid Email or password!');
  } else if (getKeyByValue(users, req.body.email)) {
    if (bcrypt.compareSync(req.body.password, users[id]['password'])) {
      req.session.user_id =  id;
      res.redirect('/urls');
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(302, '/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[`${req.params.shortURL}`]['longURL'];
  res.redirect(longURL);
});

app.post('/urls/register/newUser', (req, res) => {
  const random = generateRandomString(11, '1234567890');
  if (!req.body.email || !req.body.password) {
    res.send('bad Fields');
  } else if (getKeyByValue(users, req.body.email)) {
    res.status(400).send('Account found with this email!');
  } else {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10); 
    users[random] = {
      id: random,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = Object.keys(users)[Object.keys(users).length - 1];
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});