const utilities = require("../utilities/");
const buyModel = require("../models/buyModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Handle GET request to show purchase confirmation
async function showPurchase(req, res, next) {
    try {
        const { inv_id, inv_make, inv_model } = req.params;
        const { decoded } = req; // Get decoded JWT token from request
        const account_id = decoded?.account_id; // Get account_id from decoded token

        if (!account_id) {
            req.flash("notice", "Please log in to purchase a vehicle");
            res.redirect("/account/login");
            return;
        }

        // Get vehicle details
        const vehicle = await buyModel.getVehicleDetails(inv_id);

        if (!vehicle) {
            req.flash("notice", "Vehicle not found");
            res.redirect("/inv/");
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
            inv_make,
            inv_model
        });
    } catch (error) {
        console.error("Error showing purchase confirmation: " + error.message);
        req.flash("notice", "An error occurred while showing purchase confirmation. Please try again.");
        const nav = await utilities.getNav();
        res.render("buy/vehicle", {
            title: "Vehicle Purchase",
            nav,
            errors: null,
            messageType: "error",
            messages: req.flash("notice"),
            vehicle: null,
            purchaseSuccessPage: "",
            inv_make: "",
            inv_model: ""
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

async function showPurchaseHistory(req, res) {
    try {
    const { decoded } = req;
    const account_id = decoded?.account_id;
    const purchaseHistory = await buyModel.getPurchaseHistory(account_id);
    const nav = await utilities.getNav();
    const purchaseHistoryPage = utilities.buildPurchaseHistoryPage(purchaseHistory);
    res.render("buy/purchase-history", {
        title: "Purchase History",
        nav,
        errors: null,
        messageType: null,
        messages: req.flash("notice"),
        purchaseHistory,
        purchaseHistoryPage,
    });
    } catch (error) {
        console.error("Error showing purchase history: " + error.message);
        req.flash("notice", "An error occurred while showing purchase history. Please try again.");
        const nav = await utilities.getNav();
        res.render("buy/purchase-history", {
            title: "Purchase History",
            nav,
            errors: null,
            messageType: "error",
            messages: req.flash("notice"),
            purchaseHistory: null,
            purchaseHistoryPage: "",
        });
    }
}

module.exports = {
    showPurchase,
    completePurchase,
    showPurchaseHistory,
};
        
            