const { Router } = require("express");
const controller = require("../functions/controller");
const router = Router();
const logs = (req, res, next) => {
  console.log(`logs func: ${JSON.stringify(req.params)}`);
  next();
};
router.route("/").get(logs, controller.getAllItems);

module.exports = router;
