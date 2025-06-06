const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

invCont.buildInvAddNewClassificationPage = async function (req, res,) {
  res.render("inventory/add-classification", {
    title: "Add Classification",
    messages: null,
    messageType: null,
    nav: await utilities.getNav(),
  });
}

invCont.getNewClassification = async function (req, res) {
  const { classification_name } = req.body;
  try {
    const result = await invModel.addNewClassification(classification_name);
    if (result) {
      req.flash("notice", "Classification added successfully.");
      return res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav: await utilities.getNav(),
        classificationList: null, 
        messages: req.flash("notice"),
        messageType: "success",
        errors: null,
      });
    } else {
      req.flash("notice", "Failed to add classification. Please try again.");
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav: await utilities.getNav(),
        messages: req.flash("notice"),
        messageType: "danger",
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
      messageType: "danger",
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
      const invTitle = `${inv_make} ${inv_model}`;
      req.flash("notice", `${invTitle} was successfully added to selected classification.`);
      res.render("inventory/management", {
        title: "Vehicle Management",
        nav: await utilities.getNav(),
        classificationList: await utilities.buildClassificationList(),
        messageType: "success", 
        messages: req.flash("notice"), 
      })
    } else {
      req.flash("notice", "Failed to add inventory item. Please try again.");
      const classificationList = await utilities.buildClassificationList();
      res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        messages: req.flash("notice"),
        messageType: "danger",
        classificationList: classificationList,
        nav: await utilities.getNav(),
      });
    }
  } catch (error) {
    console.error("Error adding new inventory:", error.message);
    req.flash("notice", "An error occurred while adding the inventory item. Please try again.");
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      messages: req.flash("notice"),
      messageType: "danger",
      classificationList: classificationList,
      nav: await utilities.getNav(),
    });
  }
};

invCont.buildInvAddNewInventoryPage = async function (req, res,) {
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    messages: null,
    messageType: null,
    classificationList: classificationList, 
    nav: await utilities.getNav(),
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
        messageType: null, 
        messages: null, 
      });
    }
    const grid = await utilities.buildClassificationGrid(data);
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      messageType: null, 
      messages: null, 
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
      messages: [{ msg: "Inventory item not found" }],
      messageType: "danger",
      classificationList: await utilities.buildClassificationList()
    });
  }

  const inventoryItem = itemData[0]; 
  const itemName = `${inventoryItem.inv_make} ${inventoryItem.inv_model}`
  
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: await utilities.buildClassificationList(inventoryItem.classification_id),
    messages: null,
    messageType: null,
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
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationList,
      messageType: "success", 
      messages: req.flash("notice"), 
    })
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    messageType: "danger", 
    messages: req.flash("notice"),
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

invCont.buildDeleteInventoryPage = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryDetailsByInvId(inv_id)
  
  const inventoryItem = itemData[0]; 
  const itemName = `${inventoryItem.inv_make} ${inventoryItem.inv_model}`

  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    messages: null,
    messageType: null,
    inv_id: inventoryItem.inv_id,
    inv_make: inventoryItem.inv_make,
    inv_model: inventoryItem.inv_model,
    inv_year: inventoryItem.inv_year,
    inv_price: inventoryItem.inv_price,
    classification_id: inventoryItem.classification_id,
  });
}

invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  try {
    const result = await invModel.deleteInventory(inv_id)
    if (result) {
      req.flash("notice", "Inventory item deleted successfully.")
      return res.render("inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationList: await utilities.buildClassificationList(),
        messageType: "success", 
        messages: req.flash("notice"), 
      })
    } else {
      req.flash("notice", "Failed to delete inventory item. Please try again.")
      return res.redirect("/inv/delete/" + inv_id)
    }
  } catch (error) {
    console.error("Error deleting inventory item: " + error.message)
    req.flash("notice", "An error occurred while deleting the inventory item. Please try again.")
    return res.redirect("/inv/delete/" + inv_id)
  }
}

module.exports = invCont;
