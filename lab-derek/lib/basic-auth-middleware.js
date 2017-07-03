'use strict';

const User = require('../model/user.js');

module.exports = (req, res, next) => {
  const {authorization} = req.headers;

  if(!authorization)
    return next(new Error('Unauthorized, no authorization provided'));

  let encoded = authorization.split('Basic ')[1];
  if(!encoded)
    return next(new Error('Unauthorized, no basic auth provided'));

  let decoded = new Buffer.from(encoded, 'base64').toString();

  let [username, password] = decoded.split(':');

  if(!username || !password)
    return next(new Error('Unauthorized, username or password missing'));

  User.findOne({username})
  .then(user => {
    if(!user)
      return next(new Error('Unauthorized, user does not exist'));
    return user.passwordHashCompare(password);
  })
  .then(user => {
    req.user = user;
    next();
  })
  .catch(err => {
    next(new Error('Unauthorized, findOne failed in basic auth middleware'));
  });
};
