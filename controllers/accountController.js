const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
        messageType: null,
        messages: req.flash("notice"),
    });
}

async function buildRegister(req, res) {
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        nav,
        messageType: null,
        messages: req.flash("notice"),
    });
}

async function buildIndex(req, res) {
    let nav = await utilities.getNav();
    res.render("account/account-management", {
        title: "Account Management",
        nav,
        messageType: null,
        messages: req.flash("notice"),
    });
}

async function logout(req, res) {
    try {
        // Clear JWT cookie
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        // Set flash message
        req.flash("notice", "Successfully logged out");
        
        // Redirect to home page
        res.redirect("/");
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Error logging out" });
    }
}

/* ****************************************
 *  Process Login
 * *************************************** */
async function loginAccount(req, res) {
    const { account_email, account_password } = req.body;

    try {
        // Get user data from database
        const accountData = await accountModel.getAccountByEmail(account_email);

        if (!accountData) {
            req.flash("notice", "Invalid email or password");
            return res.redirect("/account/login");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(account_password, accountData.account_password);

        if (!isValidPassword) {
            req.flash("notice", "Invalid email or password");
            return res.redirect("/account/login");
        }

        // Delete sensitive data
        delete accountData.account_password;

        // Create JWT token
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h'
        });

        // Set JWT cookie
        res.cookie('jwt', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 // 1 hour
        });

        // Set session data
        req.session.accountData = accountData;
        
        // Set flash message
        req.flash("notice", "Successfully logged in!");
        
        // Redirect to account page
        return res.redirect("/account");
    } catch (error) {
        console.error("Login error:", error);
        req.flash("notice", "An error occurred during login");
        return res.redirect("/account/login");
    }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    let hashedPassword;
    //regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10);

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
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            messageType: "success",
            messages: req.flash("notice"),
        });
    } else {
        req.flash("notice", "Sorry, the registration failed.");
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            messageType: "danger",
            messages: req.flash("notice"),
        });
    }
}

async function buildEditAccount(req, res) {
  const nav = await utilities.getNav();
  let accountData = req.cookies.jwt;
  if (!accountData) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
const decoded = jwt.verify(accountData, process.env.ACCESS_TOKEN_SECRET);
accountData = decoded;

res.render("account/edit-account", {
    title: "Edit Account",
    nav,
    messageType: null,
    messages: req.flash("notice"),
    accountData,
  });
}
    



module.exports = { buildLogin, buildRegister, registerAccount, loginAccount, buildIndex, logout, buildEditAccount }