const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const utilities = require(".");

const validate = {};

// Validation rules for adding a new classification
validate.addClassificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Classification name is required.")
            .isLength({ min: 2 })
            .withMessage("Classification name must be at least 2 characters long.")
            .matches(/^[a-zA-Z0-9]+$/)
            .withMessage("Classification name must contain only letters and numbers (no spaces or special characters).")
            .custom(async (classification_name) => {
                const exists = await invModel.checkExistingClassification(classification_name);
                if (exists) {
                    throw new Error("Classification already exists. Please choose a different name.");
                }
            })
    ];
};

// Middleware to check the validation results
validate.checkAddClassificationData = async (req, res, next) => {
    const { classification_name } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("inventory/add-classification", {
            title: "Add Classification",
            nav: await utilities.getNav(),
            classification_name,
            errors: errors.array(), // ← Format for template
        });
    }
    next();
};

module.exports = validate;
