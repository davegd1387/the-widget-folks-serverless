require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
var createError = require("http-errors");
const cors = require("cors");
const corsObj = require("./corsObj");
const serverless = require("serverless-http");
const PORT = process.env.PORT || 4000;
const poolObj = require("./db");
const store = new (require("connect-pg-simple")(session))({
  poolObj,
});
const path = require("path");
const app = express();

const indexRouter = require("../routes");
const itemsRouter = require("../routes/items");
const protectedRouter = require("../routes/protected");
const authRouter = require("../routes/auth");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function isLoggedIn(req, res, next) {
  console.log(
    `Inside isLoggedIn func: isAuth:${JSON.stringify(req.isAuthenticated())}`
  );
  req.isAuthenticated() ? next() : res.sendStatus(401);
}
function isNotLoggedIn(req, res, next) {
  console.log(
    `Inside isNotLoggedIn func: isAuth:${JSON.stringify(req.isAuthenticated())}`
  );
  req.isAuthenticated()
    ? res.redirect(`/protected/user/${req.user.id}`)
    : next();
}

app.use((req, res, next) => {
  console.log(
    `Method: ${req.method} 
     Path: ${req.url}`
  );

  next();
});

app.set("view-engine", "ejs");
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(cors(corsObj));

app.use(
  session({
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: false,
      sameSite: false,
      maxAge: 1000 * 60 * 10,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

//from: http://johnzhang.io/options-request-in-express
app.options("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  // ---from: https://www.baeldung.com/cs/why-options-request-sent
  res.header("Access-Control-Max-Age: 300");
  // ---end: https://www.baeldung.com/cs/why-options-request-sent
  res.send(200);
});
//end: http://johnzhang.io/options-request-in-express

app.use("/protected", isLoggedIn, protectedRouter);
app.use("/auth", isNotLoggedIn, authRouter);
app.use("/items", itemsRouter);
app.use("/", isNotLoggedIn, indexRouter);
// app.use("/.netlify/functions/api", isNotLoggedIn, indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.log(`err.message/status: ${err.message} / ${err.status}`);
  // render the error page
  // res.status(err.status || 500);
  res
    .status(err.status || 500)
    .send(`err.message/status: ${err.message} / ${err.status}`);
});
// app.listen(PORT, () =>
//   console.log(`listening on port: ${PORT}/ PID=${process.pid}`)
// );
module.exports.handler = serverless(app);
