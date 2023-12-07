const express = require('express')

const paypal = require("../controllers/paypalController")
const router = express.Router();


router.route("/create-paypal-order").post( async (req, res) => {
    try {
      const order = await paypal.createOrder();
      res.json(order);
    } catch (err) {
      res.status(500).send(err.message);
    }
  })

router.route("/capture-paypal-order").post(async (req, res) => {
    const { orderID } = req.body;
    try {
      const captureData = await paypal.capturePayment(orderID);
      res.json(captureData);
    } catch (err) {
      res.status(500).send(err.message);
    }
  })

module.exports = router
