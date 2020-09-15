const LocalStrategy = require("passport-local").Strategy;

const Student = require("../models/student.model");

const bcrypt = require("bcryptjs");

const passport = require("passport");
module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
      },
      (username, password, done) => {
        // Match user
        Student.findOne({
          username: username,
        })
          .then(async (user) => {
            if (!user) {
              // null = is the error, false = user, message = flash error
              return done(null, false, {
                message: "Username or Password is incorrect",
              });
            }

            // Match the password with hashed password, isMatch is a boolean if it matches it return true
            await bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user, {
                  message: "You are now logged in",
                });
              } else {
                return done(null, false, {
                  message: "Username or Password is incorrect",
                });
              }
            });
          })
          .catch((err) => console.log(err));
      }
    )
  );

  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "username",
      },
      (username, password, done) => {
        Student.findOne({ username: username }).then(async (user) => {
          if (user) {
            return done(null, false, { message: "Username already exist" });
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          const newStudent = new Student({
            username,
            password: hashedPassword,
          });
          newStudent.save((err) => {
            done(err, newStudent);
          });
        });
      }
    )
  );

  // Grabbed from Passport docs
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    Student.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
