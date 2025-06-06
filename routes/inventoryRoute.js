// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inv-validation");
const utilities = require("../utilities");
const { route } = require("./static");

// Route to build inventory by classification view
router.get("/type/:classification_id", invController.buildByClassificationId);

router.get("/detail/:inv_id", invController.buildByInventoryId);
router.post(
  "/add-classification",
  invValidate.addClassificationRules(),
  invValidate.checkAddClassificationData,
  utilities.handleErrors(invController.getNewClassification)
);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

router.get("/add-classification", invController.buildInvAddNewClassificationPage);
router.get("/add-inventory", invController.buildInvAddNewInventoryPage);
router.post(
  "/add-inventory", invValidate.addNewInventoryRules(), invValidate.checkAddNewInventoryData,
  invController.getNewInventoryToInvModel
);

router.get("/edit/:inv_id", invController.buildInvEditInventoryPage, utilities.handleErrors);
router.post(
  "/update",
  invValidate.addUpdateInventoryRules(),
  invValidate.checkUpdateInventoryData,
  utilities.handleErrors(invController.updateInventory)
);


router.get("/", invController.buildVehilcleManagementPage);

// ...existing code...
router.get("/cause-error", (req, res, next) => {
  // Pass an error to the error-handling middleware
  next(new Error("This is an intentional server error!"));
});
module.exports = router;
