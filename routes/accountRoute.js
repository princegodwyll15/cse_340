const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')

router.get("/login", accountController.buildLogin);
router.get("/register", accountController.buildRegister);
// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    (req, res) => {
        res.status(200).send('login process')
    }
)
// Route to cause an error for testing purposes
router.get("/cause-error", (req, res, next) => {
    next(new Error("This is an intentional server error!"));
});

module.exports = router;