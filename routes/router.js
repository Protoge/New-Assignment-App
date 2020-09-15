const express = require("express");
const router = express.Router();
const { Assignment, Complete } = require("../models/assignment.model");
const Student = require("../models/student.model");
const passport = require("passport");
const ensureAuthenticated = require("../config/authenticated");

// CHANGE THIS TO SHOW USER ONLY ASSIGNMENTS
router.get("/", ensureAuthenticated, (req, res) => {
  // Assignment.find({}, (err, assignments) => {
  //   if (err) throw err;
  //   res.render("layout", {
  //     assignments
  //   });
  // });
  Student.findById(req.user._id).then((user) => {
    Assignment.find({ studentId: user._id })
      .sort({ dueDate: 1 })
      .then((assignments) => {
        return res.render("layout", { assignments });
      });
  });
  //   Student.findById(req.user._id, (err, user) => {
  //     Assignment.find({ studentId: user._id }, (err, assignments) => {
  //       if (err) throw err;
  //       res.render("layout", {
  //         assignments
  //       });
  //     });
  //   });
});

router.post("/submit", async (req, res) => {
  const { body, subject, dueDate } = req.body;
  const newAssignment = await new Assignment({
    body,
    subject,
    dueDate,
    studentId: req.user._id,
  });
  newAssignment.save().then(() => {
    Student.findById(req.user._id, async (err, user) => {
      await user.assignments.push(newAssignment);
      await user.save();
      res.redirect("/");
    });
  });
});

// Delete route

router.get("/cancel/:id", (req, res) => {
  Assignment.findByIdAndDelete(req.params.id, (err, deleted) => {
    if (err) res.redirect("/");
    if (deleted) {
      console.log("assignment deleted");
      res.redirect("/");
    }
  });
});

router.get("/complete/:subject/:body/:id", async (req, res) => {
  try {
    const newComplete = new Complete({
      student: req.user._id,
      subject: req.params.subject,
      comp: req.params.body,
    });

    await newComplete.save();

    await Student.findById(req.user._id, async (err, user) => {
      try {
        const assignmentToBeDeleted = await user.assignments.indexOf(
          req.params.id
        );
        await user.assignments.splice(assignmentToBeDeleted, 1);
        await user.save();
      } catch (err) {
        console.log(err);
      }
    });

    await Assignment.findOneAndDelete(
      {
        _id: req.params.id,
      },
      (err, deleted) => {
        if (err) res.redirect("/");
        if (deleted) {
          console.log("assignment deleted");
          res.redirect("/");
        }
      }
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
});

// Student routes

router.post("/student/register", (req, res, next) => {
  passport.authenticate("local-signup", {
    successRedirect: "/",
    failureRedirect: "/student/signin-signup",
    failureFlash: true,
  })(req, res, next);
});

router.post("/student/signin", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/student/signin-signup",
    failureFlash: true,
  })(req, res, next);
});

router.get("/student/signin-signup", (req, res, next) => {
  res.render("sign-in-sign-up");
});

// logout student
router.get("/student/logout", (req, res, next) => {
  req.logout();
  res.redirect("/student/signin-signup");
});

module.exports = router;
