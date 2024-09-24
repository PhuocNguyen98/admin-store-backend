const delay = (req, res, next) => {
  setTimeout(() => {
    next();
  }, 500);
};

module.exports = delay;
