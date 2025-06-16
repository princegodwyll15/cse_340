const buyModel = require("../models/buyModel");
const utilities = require("../utilities/");
const jwt = require("jsonwebtoken");
require("dotenv").config();


let account_id = null;
let inv_id = null;
let decoded = null;

// Handle GET request to show purchase confirmation
async function showPurchase(req, res, next) {
    try {
        inv_id = req.params.inv_id; // Updated to match new route params
        decoded = req; // Get decoded JWT token from request
        account_id = decoded?.account_id; // Get account_id from decoded token

        if (!account_id) {
            req.flash("notice", "Please log in to purchase a vehicle");
            res.redirect("/account/login");
            return;
        }
        
        // Get vehicle details
        const vehicle = await buyModel.buyVehicle(inv_id, account_id);
        
        if (!vehicle) {
            req.flash("notice", "Vehicle not found");
            const nav = await utilities.getNav();
            res.render("buy/vehicle", {
                title: "Vehicle Purchase",
                nav,
                errors: null,
                messageType: "error",
                messages: req.flash("notice"),
                vehicle: null,
                purchaseSuccessPage: ""
            });
            return;
        }

        const nav = await utilities.getNav();
        const purchaseSuccessPage = utilities.buildPurchaseSuccessPage(vehicle);
        res.render("buy/vehicle", {
            title: "Vehicle Purchase",
            nav,
            errors: null,
            messageType: null,
            messages: req.flash("notice"),
            vehicle,
            purchaseSuccessPage,
        });
    } catch (error) {
        console.error("Error showing purchase: " + error.message);
        req.flash("notice", "An error occurred while processing your purchase. Please try again.");
        const nav = await utilities.getNav();
        res.render("buy/vehicle", {
            title: "Vehicle Purchase",
            nav,
            errors: null,
            messageType: "error",
            messages: req.flash("notice"),
            vehicle: null,
            purchaseSuccessPage: ""
        });
    }
}

// Handle POST request to complete purchase
async function completePurchase(req, res, next) {
    try {
        const { inv_id, inv_make, inv_model } = req.params;
        const { decoded } = req; // Get decoded JWT token from request
        const account_id = decoded?.account_id; // Get account_id from decoded token

        if (!account_id) {
            req.flash("notice", "Please log in to purchase a vehicle");
            res.redirect("/account/login");
            return;
        }

        // Record the purchase
        const vehicle = await buyModel.buyVehicle(inv_id, account_id);

        if (vehicle) {
            req.flash("notice", "Purchase successful!");
            const nav = await utilities.getNav();
            const purchaseSuccessPage = utilities.buildPurchaseSuccessPage(vehicle);
            res.render("buy/vehicle", {
                title: "Vehicle Purchase",
                nav,
                errors: null,
                messageType: "success",
                messages: req.flash("notice"),
                vehicle,
                purchaseSuccessPage,
                inv_make,
                inv_model
            });
        } else {
            req.flash("notice", "Failed to complete purchase");
            const nav = await utilities.getNav();
            res.render("buy/vehicle", {
                title: "Vehicle Purchase",
                nav,
                errors: null,
                messageType: "error",
                messages: req.flash("notice"),
                vehicle: null,
                purchaseSuccessPage: "",
                inv_make,
                inv_model
            });
        }
    } catch (error) {
        console.error("Error completing purchase: " + error.message);
        req.flash("notice", "An error occurred while completing your purchase. Please try again.");
        const nav = await utilities.getNav();
        res.render("buy/vehicle", {
            title: "Vehicle Purchase",
            nav,
            errors: null,
            messageType: "error",
            messages: req.flash("notice"),
            vehicle: null,
            purchaseSuccessPage: ""
        });
    }
}

async function continueShopping(req, res, next) {
    try {
        const nav = await utilities.getNav();
        res.render("buy/vehicle", {
            title: "Vehicle Purchase",
            nav,
            errors: null,
            messageType: null,
            messages: req.flash("notice"),
            vehicle: null,
            purchaseSuccessPage: ""
        });
    } catch (error) {
        console.error("Error continuing shopping: " + error.message);
        req.flash("notice", "An error occurred while continuing your shopping. Please try again.");
        const nav = await utilities.getNav();
        res.render("buy/vehicle", {
            title: "Vehicle Purchase",
            nav,
            errors: null,
            messageType: "error",
            messages: req.flash("notice"),
            vehicle: null,
            purchaseSuccessPage: ""
        });
    }
}

async function purchaseHistory(req, res, next) {
    try {
        account_id = req.params;
        decoded = req;
        account_id = decoded?.account_id;

        if (!account_id) {
            req.flash("notice", "Please log in to view your purchase history");
            res.redirect("/account/login");
            return;
        }

        const purchaseHistory = await buyModel.purchaseHistory(account_id);
        const nav = await utilities.getNav();
        res.render("buy/purchase-history", {
            title: "Purchase History",
            nav,
            errors: null,
            messageType: null,
            messages: req.flash("notice"),
            purchaseHistory
        });
    } catch (error) {
        console.error("Error viewing purchase history: " + error.message);
        req.flash("notice", "An error occurred while viewing your purchase history. Please try again.");
        const nav = await utilities.getNav();
        res.render("buy/purchase-history", {
            title: "Purchase History",
            nav,
            errors: null,
            messageType: "error",
            messages: req.flash("notice"),
            purchaseHistory: null
        });
    }
}

module.exports = {
    showPurchase,
    completePurchase,
    continueShopping,
    purchaseHistory
};
        
            