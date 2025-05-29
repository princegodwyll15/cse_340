// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:invId", invController.buildByInventoryId);

// ...existing code...
router.get("/cause-error", (req, res, next) => {
  // Pass an error to the error-handling middleware
  next(new Error("This is an intentional server error!"));
});
module.exports = router;
