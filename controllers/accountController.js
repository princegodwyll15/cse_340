const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    const messages = req.flash("notice");
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null, // Always pass errors
        messages
    });
}

async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    const messages = req.flash("notice");
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null, // Always pass errors
        messages
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    let hashedPassword;
    try {
        //regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hash(account_password, 10);
    } catch (error) {
        req.flash("notice", "Sorry, the registration failed due to a hashing error.");
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        });
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    );

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you're registered ${account_firstname}. Please log in.`
        );
        const messageType = "success"; // Define the message type
        const messages = req.flash("notice"); // Retrieve the message right after setting it
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            messages,
            messageType,
            errors: null // Always pass errors
        });
    } else {
        req.flash("notice", "Sorry, the registration failed.");
        const messageType = "danger"; // Define the message type
        const messages = req.flash("notice"); // Retrieve the message right after setting it
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            messages,
            messageType,
            errors: null // Always pass errors
        });
    }
}
module.exports = { buildLogin, buildRegister, registerAccount }