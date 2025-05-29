const utilities = require("../utilities/");
const accountModel = require("../models/account-model");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    const messages = req.flash("notice")
    res.render("account/login", {
        title: "Login",
        nav,
        messages
    })
}

async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    const messages = req.flash("notice")
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        messages
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
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
            messageType
        });
    } else {
        req.flash("notice", "Sorry, the registration failed.");
        const messageType = "error"; // Define the message type
        const messages = req.flash("notice"); // Retrieve the message right after setting it
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            messages,
            messageType
        });
    }
}
module.exports = { buildLogin, buildRegister, registerAccount }