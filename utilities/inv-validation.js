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
            .custom(async (value) => {
                // Check if the classification already exists
                const existingClassification = await invModel.getClassificationByName(value);
                if (existingClassification) {
                    throw new Error("This classification already exists.");
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

validate.checkExistingClassification = async (req, res, next) => {
    const { classification_name } = req.body;
    try {
        const existingClassification = await invModel.getClassificationByName(classification_name);
        if (existingClassification) {
            return res.render("inventory/add-classification", {
                title: "Add Classification",
                nav: await utilities.getNav(),
                classification_name,
                errors: [{ msg: "This classification already exists." }],
            });
        }
        next();
    } catch (error) {
        console.error("Error checking existing classification: " + error.message);
        return res.status(500).render("inventory/add-classification", {
            title: "Add Classification",
            nav: await utilities.getNav(),
            errors: [{ msg: "An unexpected error occurred. Please try again." }],
        });
    }
};

module.exports = validate;
