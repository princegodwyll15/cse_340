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
        errors: null,
        messageType: null,
        messages: req.flash("notice"),
    });
}

async function buildRegister(req, res) {
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        messageType: "danger",
        messages: req.flash("notice"),
    });
}

async function buildIndex(req, res) {
    let nav = await utilities.getNav();
    res.render("account/account-management", {
        title: "Account Management",
        nav,
        errors: null,
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
            res.render("account/login", {
                title: "Login",
                nav: await utilities.getNav(),
                errors: null,
                messageType: "danger",
                messages: req.flash("notice"),
            });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(account_password, accountData.account_password);

        if (!isValidPassword) {
            req.flash("notice", "Invalid email or password");
            res.render("account/login", {
                title: "Login",
                nav: await utilities.getNav(),
                errors: null,
                messageType: "danger",
                messages: req.flash("notice"),
            });
            return;
        }

        // Delete sensitive data
        delete accountData.account_password;

        // Create JWT token with only necessary data
        const tokenData = {
            account_id: accountData.account_id,
            account_email: accountData.account_email,
            account_type: accountData.account_type
        };

        // Create JWT token
        const accessToken = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h'
        });

        // Set JWT token as cookie
        res.cookie('jwt', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        // Redirect to account management page
        res.redirect('/account');

        // Set JWT cookie
        res.cookie('jwt', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 // 1 hour
        });
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
            errors: null,
            messages: req.flash("notice"),
        });
    } else {
        req.flash("notice", "Sorry, the registration failed.");
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: req.flash("notice"),
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
        errors: null,
        messageType: null,
        messages: req.flash("notice"),
        accountData,
    });
}

async function updateAccount(req, res) {
    const { account_firstname, account_lastname, account_email } = req.body;
    let accountData = req.cookies.jwt;

    if (!accountData) {
        req.flash("notice", "Please log in.");
        return res.redirect("/account/login");
    }

    const decoded = jwt.verify(accountData, process.env.ACCESS_TOKEN_SECRET);
    accountData = decoded;

    // Update the account in the database
    accountModel.updateAccount({
        account_id: accountData.account_id,
        account_firstname,
        account_lastname,
        account_email
    })
        .then((updatedAccount) => {
            // Update the JWT token with new account data
            const newToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            });

            // Set the new JWT cookie
            res.cookie('jwt', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 // 1 hour
            });

            // Update session data
            req.session.accountData = updatedAccount;
        })
        .then(() => {
            req.flash("notice", "Account updated successfully.");
            res.redirect("/account");
        })
        .catch((error) => {
            console.error("Update error:", error);
            req.flash("notice", "Error updating account.");
            res.redirect("/account/update/" + accountData.account_id);
        });
}

async function updateAccountPassword(req, res) {
    const { account_id, account_password, confirm_password } = req.body;
    let accountData = req.cookies.jwt;
    // Check if passwords match
    if (account_password !== confirm_password) {
        req.flash("notice", "Passwords do not match.");
        return res.redirect("/account/update/" + req.params.account_id);
    }
    // Check if JWT token exists
    if (!accountData) {
        req.flash("notice", "Please log in.");
        return res.redirect("/account/login");
    }

    const decoded = jwt.verify(accountData, process.env.ACCESS_TOKEN_SECRET);
    accountData = decoded;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10);

    // Update the account password in the database
    accountModel.updateAccountPassword(account_id, hashedPassword)
        .then(() => {
            req.flash("notice", "Password updated successfully.");
            res.redirect("/account");
        })
        .catch((error) => {
            console.error("Update password error:", error);
            req.flash("notice", "Error updating password.");
            res.redirect("/account/update/" + accountData.account_id);
        });
}




module.exports = { buildLogin, buildRegister, registerAccount, loginAccount, buildIndex, logout, buildEditAccount, updateAccount, updateAccountPassword };
// This code is part of the account management system for a web application.
// It handles user registration, login, account management, and password updates.
// The code uses bcrypt for password hashing and JWT for session management.
// It also includes error handling and session management using cookies.
// The functions are designed to be used with an Express.js application and utilize middleware for validation and error handling.
// The code is modular, allowing for easy integration with other parts of the application, such as inventory management and user roles.
// The code is structured to provide a clear separation of concerns, making it easier to maintain and extend in the future.
// The code is designed to be secure, using best practices for password storage and session management.     