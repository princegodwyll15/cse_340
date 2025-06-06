const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

invCont.buildInvAddNewClassificationPage = async function (req, res,) {
  res.render("inventory/add-classification", {
    title: "Add Classification",
    messages: req.flash("notice"),
    nav: await utilities.getNav(),
    errors: null, 
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
        classificationList: null, 
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
  const {
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  } = req.body;

  console.log("req.body:", req.body); 
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
      res.redirect("/inv/type/" + classification_id);
    } else {
      req.flash("notice", "Failed to add inventory item. Please try again.");
      const classificationList = await utilities.buildClassificationList();
      res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        messages: req.flash("notice"),
        classificationList: classificationList,
        nav: await utilities.getNav(),
        errors: null
      });
    }
  } catch (error) {
    console.error("Error adding new inventory:", error.message);
    req.flash("notice", "An error occurred while adding the inventory item. Please try again.");
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      messages: req.flash("notice"),
      classificationList: classificationList,
      nav: await utilities.getNav(),
      errors: null
    });
  }
};

invCont.buildInvAddNewInventoryPage = async function (req, res,) {
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    messages: req.flash("notice"),
    nav: await utilities.getNav(),
    classificationList: classificationList, 
    errors: null, 
  });
}

invCont.buildVehilcleManagementPage = async function (req, res, next) {
  try {
    const classificationList = await utilities.buildClassificationList()
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav: await utilities.getNav(),
      classificationList,
      messageType: null, 
      messages: null, 
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
    const classification_id = req.params.classification_id;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    let nav = await utilities.getNav();

    if (!data || data.length === 0) {
      return res.status(404).render("./inventory/classification", {
        title: "No vehicles found",
        nav,
        grid: "<p>No vehicles found for this classification.</p>",
      });
    }
    const grid = await utilities.buildClassificationGrid(data);
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
    const inv_id = req.params.inv_id;
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

/* ***************************
*  Return Inventory by Classification As JSON
* ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildInvEditInventoryPage = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryDetailsByInvId(inv_id)
  
  if (!itemData || itemData.length === 0) {
    return res.status(404).render("./inventory/edit-inventory", {
      title: "Inventory Not Found",
      nav,
      errors: [{ msg: "Inventory item not found" }],
      classificationList: await utilities.buildClassificationList()
    });
  }

  const inventoryItem = itemData[0]; 
  const itemName = `${inventoryItem.inv_make} ${inventoryItem.inv_model}`
  
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: await utilities.buildClassificationList(inventoryItem.classification_id),
    errors: null,
    inv_id: inventoryItem.inv_id,
    inv_make: inventoryItem.inv_make,
    inv_model: inventoryItem.inv_model,
    inv_year: inventoryItem.inv_year,
    inv_description: inventoryItem.inv_description,
    inv_image: inventoryItem.inv_image,
    inv_thumbnail: inventoryItem.inv_thumbnail,
    inv_price: inventoryItem.inv_price,
    inv_miles: inventoryItem.inv_miles,
    inv_color: inventoryItem.inv_color,
    classification_id: inventoryItem.classification_id
  })
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id,
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
    })
  }
}

module.exports = invCont;
