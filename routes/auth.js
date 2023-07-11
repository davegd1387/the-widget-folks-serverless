// const { Router } = require("express");
const express = require("express");
const { emailExists, createUser } = require("../functions/controller");
const router = express.Router();
const passport = require("passport");
require("../functions/authLocal");

router.route("/local").post((req, res, next) => {
  console.log(`In /auth/login POST route callback`);
  console.log(`...req.body: ${JSON.stringify(req.body)}`);

  passport.authenticate("login", (err, user, info) => {
    console.log(
      `err: ${err}, user: ${JSON.stringify(user)}, info: ${JSON.stringify(
        info
      )}`
    );
    if (err) {
      // return next(err);
      return res.sendStatus(403);
    }
    if (!user) {
      console.log(`...user: ${user}`);
      // return res.redirect("/login");
      return res.sendStatus(401);
    }
    // return res.redirect('/protected');
    req.login(user, (error) => {
      if (error) {
        console.log(`On req.login - error: ${error}`);
        return next(error);
      }
      // res.send(`${req.user.email} Logged In Successfully`);
      console.log(
        ` ${
          req.user.email
        } auth > ${req.isAuthenticated()} - >> /protected/user/${req.user.id}`
      );
      // added below to cure situation of deserializeUser not firing due to redirect occuring before session save
      req.session.save(() => {
        return res.redirect(`/protected/user/${req.user.id}`);
      });
    });
  })(req, res, next);
});

router.route("/register").post(async (req, res, next) => {
  console.log(`In /auth/register POST route callback`);
  try {
    let message;
    const {
      email,
      password,
      address1,
      address2,
      city,
      zip,
      state,
      telephone,
      firstName,
      lastName,
    } = req.body;
    const userExists = await emailExists(email);

    if (userExists.rowCount > 0) {
      message = `email ${email} already exists!`;
      console.log(message);
      return res.sendStatus(409);
    } else {
      const user = await createUser(
        email,
        password,
        address1,
        address2,
        city,
        zip,
        state,
        telephone,
        firstName,
        lastName
      );
      // const user = await createUser(email, password);
      message = "User added successfully";
      console.log(message);
      req.login(user, (err) => {
        console.log("login successful");
        req.session.save(() => {
          res.redirect(`/protected/user/${req.user.id}`);
        });
      });
    }
  } catch (e) {
    message = `Register error: ${e}`;
    console.log(message);
    res.redirect("/register");
  }
});

module.exports = router;
