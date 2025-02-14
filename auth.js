const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport'); // imports passport config with auth strategy

require('./passport');

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // identifies the user in the token
    expiresIn: '7d', // valid for 7 days
    algorithm: 'HS256',
  });
};

/*  POST endpoint to log in a user */

module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      // Disables sessions since JWT handles authentication
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON()); // create JWT and converts user to JSON to remove unwanted data
        return res.json({ user, token });
      });
    })(req, res);
  });
};
