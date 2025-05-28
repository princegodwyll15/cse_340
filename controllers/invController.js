const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

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
