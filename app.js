const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

require("dotenv").config();

require("./config/passport")(passport);

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  () => console.log("db connected")
);

const db = mongoose.connection;

db.on("error", () => console.log("db unsuccessfull"));

app.use(helmet());
app.use(express.static(__dirname + "/public"));
app.use(
  express.urlencoded({
    extended: true
  })
);
app.set("view engine", "ejs");

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", require("./routes/router"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("port running 5000"));
