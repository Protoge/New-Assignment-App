const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment"
    }
  ]
});

const Student = mongoose.model("student", studentSchema);

module.exports = Student;
