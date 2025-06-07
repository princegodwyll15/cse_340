// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inv-validation");
const utilities = require("../utilities");

// Route to build vehicle management page
router.get("/", utilities.checkRole, utilities.handleErrors(invController.buildVehilcleManagementPage));

// Route to build inventory by classification view
router.get("/type/:classification_id", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory by inventory id
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));


// Route to add classification
router.post("/add-classification", invValidate.addClassificationRules(), invValidate.checkAddClassificationData, utilities.handleErrors(invController.getNewClassification));

// Route to get inventory by classification id
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to add inventory
router.get("/add-classification", utilities.checkRole, utilities.handleErrors(invController.buildInvAddNewClassificationPage));
router.get("/add-inventory", utilities.checkRole, utilities.handleErrors(invController.buildInvAddNewInventoryPage));
router.post("/add-inventory", invValidate.addNewInventoryRules(), invValidate.checkAddNewInventoryData, utilities.handleErrors(invController.getNewInventoryToInvModel));


// Route to edit inventory
router.get("/edit/:inv_id", utilities.checkRole, utilities.handleErrors(invController.buildInvEditInventoryPage));
router.post("/update", invValidate.addUpdateInventoryRules(), invValidate.checkUpdateInventoryData, utilities.handleErrors(invController.updateInventory));

// Route to delete inventory
router.post("/delete/:inv_id", utilities.checkRole, utilities.handleErrors(invController.deleteInventory));
router.get("/delete/:inv_id", utilities.checkRole, utilities.handleErrors(invController.buildDeleteInventoryPage));


// Route to cause an error for testing purposes
router.get("/cause-error", (req, res, next) => {
  next(new Error("This is an intentional server error!"));
});


module.exports = router;
