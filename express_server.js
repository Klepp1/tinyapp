const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;


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


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
app.post('/urls', (req, res) => {
  console.log(req.body);
  urlDatabase[rString] = req.body.longURL;
  res.redirect(`/urls/${rString}`);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`], links: urlDatabase };
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
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[`${req.params.shortURL}`];
  res.redirect(longURL);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});