const getUserByEmail = (email, dataBase) => {
  for (const prop in dataBase) {
    if (dataBase[prop].email === email) {
      return prop;
    }
  }
  return undefined;
};

const generateRandomString = (length, chars) => {
  let result = '';
  for (let i = length; i > 0; --i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return result;
};
  

module.exports = {getUserByEmail, generateRandomString};
/*for (const prop2 in prop) {
  if (prop[prop2] === email) {
    return true;
  }
}
*/