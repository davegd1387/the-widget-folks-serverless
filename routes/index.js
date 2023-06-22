const { Router } = require("express");
const router = Router();
// const logs = (req, res, next) => {
//   console.log(`logs func: ${JSON.stringify(req.params)}`);
//   next();
// }
router.route("/").get((req, res) => {
  res.send('<a href="/login">Login</a>');
});
router.route("/login").get((req, res) => {
  // res.render('login.ejs');
  res.render("login.ejs", { message: " " });
});
router.route("/register").get((req, res) => {
  // res.render('login.ejs');
  res.render("register.ejs", { message: " " });
});

module.exports = router;
