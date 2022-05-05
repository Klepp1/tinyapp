const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers');
const { generateRandomString } = require('./helpers');

const urlsForUser = (id) => {
  let userURLS = {};
  for (const prop in urlDatabase) {
    if (urlDatabase[prop].userID === id) {
      userURLS[prop] = urlDatabase[prop];
    }
  }
  return userURLS;
};

const rStringg = generateRandomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

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

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
// this is the route for the login page
app.get('/urls/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  res.render('urls_login', templateVars);
});
//this is the route for the home page/ urls page
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});
//this route is for creating new shortURLS page
app.get('/urls/new', (req, res) => {
  const templateVars = {user: users[req.session.user_id] };
  if (!users[req.session.user_id]) {
    res.redirect('/urls/login');
  } else {
    res.render('urls_new', templateVars);
  }
});
// this route is for rendering the register page
app.get('/urls/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_register', templateVars);
});
// this route is for redirecting you to the website of the shortURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[`${req.params.shortURL}`]['longURL'];
  res.redirect(longURL);
});
// this route is for actually creating the new shortURL when you hit submit
app.post('/urls', (req, res) => {
  if (!users[req.session.user_id]['id']) {
    res.status(403).send('You must login to create a TinyURL');
  }
  const rString = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[rString] = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id]['id']
  };
  res.redirect(`/urls/${rString}`);
});
// this route is for taking you to the page of the shortURL where you can edit
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send('This is not your URL!');
  }
  if (urlDatabase[req.params.shortURL]['id'] === req.session.user_id['id']) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`]['longURL'], user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  }
});
// this route is the functionality of actually editing a shortURL to something different
app.post('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]['id'] === req.session.user_id['id']) {
    urlDatabase[req.params.shortURL]['longURL'] = req.body['New URL'];
    res.redirect(req.params.shortURL);
  } else {
    res.status(403).send('This is not your URL!');
  }
});
// this route is for when you click the delete button on a shortURL
app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send('This is not your URL!');
  }
  if (urlDatabase[req.params.shortURL]['id'] === req.session.user_id['id']) {
    delete urlDatabase[`${req.params.shortURL}`];
    res.redirect('http://localhost:8080/urls');
  }
});
// this route is for when someone logs into the server or tries too
app.post('/urls/login/new', (req, res) => {
  let id = getUserByEmail(req.body.email, users);
  if (!getUserByEmail(req.body.email, users) || !bcrypt.compareSync(req.body.password, users[id]['password'])) {
    res.status(403).send('Invalid Email or password!');
  } else if (getUserByEmail(req.body.email, users)) {
    if (bcrypt.compareSync(req.body.password, users[id]['password'])) {
      req.session.user_id = id;
      res.redirect('/urls');
    }
  }
});
// this simple route clears the session when you click logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(302, '/urls');
});
// this route is for when a new user clicks register
app.post('/urls/register/newUser', (req, res) => {
  const random = generateRandomString(11, '1234567890');
  if (!req.body.email || !req.body.password) {
    res.status(400).send('bad Fields');
  } else if (getUserByEmail(req.body.email, users)) {
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