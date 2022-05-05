const { assert } = require('chai');
const { getUserByEmail } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('testing getUserByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expected = 'userRandomID';
    assert.equal(user, expected);
  });
  it('should return undefined when given a email thats not in the database', () => {
    const user = getUserByEmail('kyler@gmail.com', testUsers);
    const expected = undefined;
    assert.equal(user, expected);
  });
});