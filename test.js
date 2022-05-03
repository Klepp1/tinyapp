const findKeyByValue = (obj, value) => {
  for (const prop in obj) {
    for (const prop2 in obj[prop]) {
      if (obj[prop][prop2] === value) {
        return prop;
      }
    }
  }
};

module.exports = findKeyByValue;