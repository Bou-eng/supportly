const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  token = req.cookies?.accessToken;

  if (token) {
    try {

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token ID
      req.user = await User.findById(decoded.id).select('-passwordHash').populate('team', 'name');

      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists in database' });
      }

      if (req.user.status !== 'active') {
        return res.status(401).json({ message: 'This account is inactive' });
      }

      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no valid session provided' });
};

module.exports = { protect };