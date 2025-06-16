/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expresslayout = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const baseController = require("./controllers/baseController");
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities");
const session = require("express-session");
const accountRoute = require("./routes/accountRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const buyRoute = require("./routes/buyRoute");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expresslayout);
app.set("layout", "./layouts/layout");

/* ***********************
 * bodyParser Middleware
 *************************/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* ***********************
 * cookieParser Middleware
 *************************/
app.use(cookieParser());

/* ***********************
 * Session Middleware
 *************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool: require("./database/"),
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}))

/* ***********************
 * Express Messages Middleware
 *************************/
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * Authentication Middleware
 *************************/
app.use(async (req, res, next) => {
  res.locals.loggedin = res.locals.loggedin || false;
  res.locals.accountData = res.locals.accountData || null;
  next();
});

/* ***********************
 * JWT Middleware
 *************************/
app.use(utilities.checkJWTToken);

/* ***********************
 * Routes
 *************************/
app.use("/account", accountRoute)
app.use("/purchase", buyRoute);
app.use("/inv", inventoryRoute);
app.use(static);
app.use(utilities.checkJWTToken);
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  const status = err.status || 500;
  const message =
    status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";

  res.status(status).render("errors/error", {
    title: status,
    message,
    nav,
  });
});

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
