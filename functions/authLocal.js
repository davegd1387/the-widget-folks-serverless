const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { emailExists, getUserById } = require("./controller");
passport.use(
  "login",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      console.log(
        `authenticateUser...starting... email: ${email} ...password: ${password}`
      );

      try {
        const user = await emailExists(email);
        if (user.rowCount == 0) {
          console.log(`--- email ${email} not found!`);
          return done(null, false, "Invalid Login 1");
        }

        if (await bcrypt.compare(password, user.rows[0].password)) {
          console.log(`---password match! ${user.rows[0].email}`);
          // return done(null, {email: user.rows[0].email},'Good Login !');
          return done(
            null,
            {
              id: user.rows[0].id,
              email: user.rows[0].email,
              isadmin: user.rows[0].isadmin,
            },
            "Good Login !"
          );
        }

        console.log(`---password does not match!`);
        return done(null, false, "Invalid Login 2");
      } catch (error) {
        console.log(`---email error caught: ${error}!`);
        return done(error, false);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  console.log(`Inside serializeUser user: ${JSON.stringify(user)}`);
  done(null, user);
});
passport.deserializeUser(async (user, done) => {
  console.log(`Inside deserializeUser  user: ${JSON.stringify(user)}`);
  const data = await getUserById(user.id);
  console.log(`... data returned: ${JSON.stringify(data.rows[0])}`);

  return done(null, data.rows[0]);
});
