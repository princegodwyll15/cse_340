const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')

//routes to build login and register pages
router.get("/login", accountController.buildLogin);
router.get("/register", accountController.buildRegister);

// Process the registration data
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login request
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.loginAccount));

//route to build account management page
router.get("/", utilities.checkLogin, accountController.buildIndex);

//route to build edit account page
router.get("/update/:account_id", utilities.checkLogin, accountController.buildEditAccount);

//route to update account
router.post("/update/:account_id", regValidate.updateAccountRules(), regValidate.checkUpdateAccountData, utilities.handleErrors(accountController.updateAccount));

router.post("/update-password/:account_id", regValidate.updatePasswordRules(), regValidate.checkUpdatePasswordData, utilities.handleErrors(accountController.updateAccountPassword));

//route to logout
router.get("/logout", utilities.handleErrors(accountController.logout))

// Route to cause an error for testing purposes
router.get("/cause-error", (req, res, next) => {
    next(new Error("This is an intentional server error!"));
});

module.exports = router;