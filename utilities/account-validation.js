const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model")
const validate = {};

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the database
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use different email")
                }
            }),
        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password does not meet requirements."),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    const errors = validationResult(req)
    if (errors.array().length > 0) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors: errors.array(),
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* ******************************
 *  Login Data Validation Rules
 * ***************************** */
validate.loginRules = () => {
    return [
        // valid email is required
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required."),
        // password is required
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password is required."),
    ]
}

validate.checkLoginData = async (req, res, next) => {
    const { account_email, account_password } = req.body
    const errors = validationResult(req)
    if (errors.array().length > 0) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
            account_password
        })
        return
    }
    next()
}


/* ******************************
 *  Update Account Data Validation Rules
 * ***************************** */
validate.updateAccountRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the database
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
    ]
}
validate.checkUpdateAccountData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    const errors = validationResult(req)
    if (errors.array().length > 0) {
        let nav = await utilities.getNav()
        res.render("account/edit-account", {
            errors: errors.array(),
            title: "Edit Account",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* ******************************
 *  Update Password Data Validation Rules
 * ***************************** */
validate.updatePasswordRules = () => {
    return [
        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password can not be empty."),
        // confirm password is required and must match password
        body("confirm_password")
            .trim()
            .notEmpty()
            .withMessage("Confirm password can not be empty.")
            .custom((confirm_password, { req }) => {
                if (confirm_password !== req.body.account_password) {
                    throw new Error("Passwords do not match.")
                }
                return true
            }),
    ]
}

validate.checkUpdatePasswordData = async (req, res, next) => {
    const { account_password, confirm_password } = req.body
    // Check for validation errors
    const errors = validationResult(req)
    if (errors.array().length > 0) {
        let nav = await utilities.getNav()
        res.render("account/edit-account", {
            errors: errors.array(),
            title: "Edit Account",
            nav,
            account_password,
            confirm_password,
        })
        return
    }
    next()
}


module.exports = validate