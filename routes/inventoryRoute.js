// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inv-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:invId", invController.buildByInventoryId);
router.post(
  "/add-classification",
  invValidate.addClassificationRules(),
  invValidate.checkAddClassificationData,
  invController.getNewClassification
);

router.get("/add-classification", invController.buildInvAddNewClassificationPage);
router.get("/add-inventory", invController.buildInvAddNewInventoryPage);
router.get("/", invController.buildVehilcleManagementPage);

// ...existing code...
router.get("/cause-error", (req, res, next) => {
  // Pass an error to the error-handling middleware
  next(new Error("This is an intentional server error!"));
});
module.exports = router;
