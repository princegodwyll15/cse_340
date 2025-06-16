const express = require("express");
const utilities = require("../utilities/");
const router = express.Router();
const buyController = require("../controllers/buyController");
const { checkJWT } = require("../utilities/");

// GET route to show purchase confirmation
router.get("/:inv_make/:inv_model/:inv_id", [checkJWT], buyController.showPurchase);

// POST route to handle the purchase
router.post("/:inv_make/:inv_model/:inv_id", [checkJWT], buyController.completePurchase);

// GET route to show purchase history
router.get("/history/:account_id", [checkJWT], buyController.showPurchaseHistory);

module.exports = router;