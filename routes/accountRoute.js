const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");

router.get("/login", accountController.buildLogin);
router.get("/register", accountController.buildRegister);
router.post('/register', utilities.handleErrors(accountController.registerAccount))

router.get("/cause-error", (req, res, next) => {
    next(new Error("This is an intentional server error!"));
});

module.exports = router;