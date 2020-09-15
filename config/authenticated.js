const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/student/signin-signup");
  }
};

module.exports = ensureAuthenticated;
