const { Router } = require("express");
// const controller = require("../controller");
const controller = require("../functions/controller");
const router = Router();
const logs = (req, res, next) => {
  console.log(`logs func: ${JSON.stringify(req.params)}`);
  next();
};
router.route("/").get(logs, controller.getCusts);
router.route("/logout").get(logs, (req, res) => {
  console.log(`req.logout: ${JSON.stringify(req.user)}`);
  const email = req.user.email;
  req.logout();
  req.session.destroy();
  res.send(`Goodbye: ${email}!`);
});
router.route("/admin/:id").get(logs, controller.getCustById);
router.route("/sales/:id").get(logs, controller.getSalesByCustId);
router.route("/sale/:id").get(logs, controller.getSaleDetails);
router.route("/user/:id").get(logs, controller.getCustAllInfo);
// router.route("/:id").get(logs, controller.getCustById);

module.exports = router;
