const express = require("express");
const utilities = require("../utilities/");
const router = express.Router();
const buyController = require("../controllers/buyController");
const { checkJWTToken } = require("../utilities/");

// GET route to show purchase confirmation
router.get("/:inv_make/:inv_model/:inv_id", [checkJWTToken], utilities.handleErrors(buyController.showPurchase));

// POST route to handle the purchase
router.post("/:inv_make/:inv_model/:inv_id", [checkJWTToken], utilities.handleErrors(buyController.completePurchase));

// GET route for purchase history
router.get("/purchase-history/:account_id", [checkJWTToken], utilities.handleErrors(buyController.purchaseHistory));

// GET route for continuing shopping
router.get("/continue-shopping", [checkJWTToken], utilities.handleErrors(buyController.continueShopping));

module.exports = router;