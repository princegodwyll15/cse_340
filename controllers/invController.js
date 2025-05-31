const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

invCont.buildInvAddNewClassificationPage = async function (req, res,) {
  res.render("inventory/add-classification", {
    title: "Add Classification",
    messages: req.flash("notice"),
    // This will be used to populate the dropdown in the add classification form
    nav: await utilities.getNav(),

    errors: null, // Always pass errors
  });
}

invCont.getNewClassification = async function (req, res) {
  const { classification_name } = req.body;
  try {
    const result = await invModel.addNewClassification(classification_name);
    if (result) {
      req.flash("notice", "Classification added successfully.");
      const messageType = "success";
      return res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav: await utilities.getNav(),
        messages: req.flash("notice"),
        messageType,
        errors: null,
      });
    } else {
      req.flash("notice", "Failed to add classification. Please try again.");
      const messageType = "danger";
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav: await utilities.getNav(),
        messages: req.flash("notice"),
        messageType,
        errors: null,
      });
    }
  } catch (error) {
    console.error("Error adding new classification: " + error.message);
    req.flash("notice", "An error occurred while adding the classification.");
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav: await utilities.getNav(),
      messages: req.flash("notice"),
      errors: [{ msg: "An unexpected error occurred. Please try again." }],
    });
  }
};


invCont.getNewInventoryToInvModel = async function (req, res) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
  try {
    const result = await invModel.addNewInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
    if (result) {
      req.flash("notice", "Inventory item added successfully.");
      res.redirect("/inventory/type/" + classification_id);
    } else {
      req.flash("notice", "Failed to add inventory item. Please try again.");
      res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        messages: req.flash("notice"),
        nav: await utilities.getNav(),
        errors: null, // Always pass errors
      });
    }
  } catch (error) {
    console.error("Error adding new inventory: " + error.message);
    req.flash("notice", "An error occurred while adding the inventory item. Please try again.");
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      messages: req.flash("notice"),
      nav: await utilities.getNav(),
      errors: null, // Always pass errors
    });
  }
};
// Build the add new inventory view

invCont.buildInvAddNewInventoryPage = async function (req, res,) {
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    messages: req.flash("notice"),
    nav: await utilities.getNav(),
    classificationList: classificationList, // Pass the classification list to the view
    // This will be used to populate the dropdown in the add inventory form
    errors: null, // Always pass errors
  });
}

invCont.buildVehilcleManagementPage = async function (req, res) {
  try {
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav: await utilities.getNav(),
      errors: null,
    });
  } catch (error) {
    console.error("Error building Vehicle Management page: " + error.message);
    next(error);
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error building Classification by Id: " + error.message);
    next(error);
  }
};

invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const data = await invModel.getInventoryDetailsByInvId(inv_id);
    const inv_Details = await utilities.buildEachVehicleFromInventoryById(data);
    let nav = await utilities.getNav();
    const title = data[0]
      ? `${data[0].inv_make} ${data[0].inv_model}`
      : "Vehicle Details";
    res.render("inventory/invid", {
      title,
      nav,
      inv_Details,
    });
  } catch (error) {
    console.error("Error building Inventory by Id: " + error.message);
    next(error);
  }
};

module.exports = invCont;
