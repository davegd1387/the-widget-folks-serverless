const { Router } = require("express");
// const controller = require("../controller");
const {
  getCusts,
  getCustById,
  createSale,
  getSaleDetails,
  getSalesByCustId,
  getCustAllInfo,
} = require("../functions/controller");
// const controller = require("../functions/controller");
const router = Router();
const logs = (req, res, next) => {
  console.log(`logs func: ${JSON.stringify(req.params)}`);
  next();
};
router.route("/").get(logs, getCusts);
// router.route("/").get(logs, controller.getCusts);
router.route("/logout").get(logs, (req, res) => {
  console.log(`req.logout: ${JSON.stringify(req.user)}`);
  const email = req.user.email;
  req.logout();
  req.session.destroy();
  res.send(`Goodbye: ${email}!`);
});
router.route("/admin/:id").get(logs, getCustById);
// router.route("/admin/:id").get(logs, controller.getCustById);
router.route("/sales/:id").get(logs, getSalesByCustId);
// router.route("/sales/:id").get(logs, controller.getSalesByCustId);
router.route("/sales/new").post(logs, async (req, res) => {
  console.log(`req.body: ${JSON.stringify(req.body)}`);
  const { saleDate, amount, tax, taxStatus, custId, saleItems } = req.body;
  let message;
  try {
    const newSale = await createSale(
      saleDate,
      amount,
      tax,
      taxStatus,
      custId,
      saleItems
    );
    message = `New Sale Successful: ${JSON.stringify(newSale)}`;
    console.log(message);
    res.status(200).json(newSale);
  } catch (err) {
    message = `New Sale Error: ${err}`;
    console.log(message);
    res.status(400).send(message);
  }
});
router.route("/sale/:id").get(logs, getSaleDetails);
// router.route("/sale/:id").get(logs, controller.getSaleDetails);
router.route("/user/:id").get(logs, getCustAllInfo);
// router.route("/user/:id").get(logs, controller.getCustAllInfo);
// router.route("/:id").get(logs, controller.getCustById);

module.exports = router;
