const isHR = (req, res, next) => {
    if (req.user.role === 'hr') {
      return next();
    } else {
      return res.status(403).json({ message: 'Access denied. HR only.' });
    }
  };
  module.exports = { isHR};
  