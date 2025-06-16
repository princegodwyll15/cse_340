const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the each vehicle by inv_id in view HTML
 * ************************************ */
Util.buildEachVehicleFromInventoryById = async function (data) {
  let eachVehicleTemplate;
  if (data.length > 0) {
    eachVehicleTemplate = '<ul id="inv_model">';
    data.forEach((inv_vehicle) => {
      console.log(inv_vehicle.inv_miles);
      eachVehicleTemplate += '<li class="vehicle-detail-item">';
      eachVehicleTemplate += '<div class="vehicle-main">';
      eachVehicleTemplate += `<h2>${inv_vehicle.inv_year} ${inv_vehicle.inv_make} ${inv_vehicle.inv_model}</h2>`;
      eachVehicleTemplate += `<img src="${inv_vehicle.inv_thumbnail}" alt="Image of ${inv_vehicle.inv_year} ${inv_vehicle.inv_make} ${inv_vehicle.inv_model}" class="vehicle-detail-img" />`;
      eachVehicleTemplate += "</div>";
      eachVehicleTemplate += '<div class="vehicle-detail-info">';
      eachVehicleTemplate += `<h3>Name of vehicle: ${inv_vehicle.inv_make} ${inv_vehicle.inv_model}</h3>`;
      eachVehicleTemplate += `<h4>Price: $${new Intl.NumberFormat(
        "en-US"
      ).format(inv_vehicle.inv_price)}</h4>`;
      eachVehicleTemplate += `<p><b>Description:</b> ${inv_vehicle.inv_description}</p>`;
      eachVehicleTemplate += `<p><b>Color:</b> ${inv_vehicle.inv_color}</p>`;
      eachVehicleTemplate += `<p><b>Miles:</b> ${new Intl.NumberFormat("en-US").format(inv_vehicle.inv_miles)}</p>`;
      eachVehicleTemplate += `<form action="/purchase/${inv_vehicle.inv_make}/${inv_vehicle.inv_model}/${inv_vehicle.inv_id}" method="post" class="cart-form">`;
      eachVehicleTemplate += `<input type="hidden" name="inv_id" value="${inv_vehicle.inv_id}" />`;
      eachVehicleTemplate += `<input type="hidden" name="inv_make" value="${inv_vehicle.inv_make}" />`;
      eachVehicleTemplate += `<input type="hidden" name="inv_model" value="${inv_vehicle.inv_model}" />`;
      eachVehicleTemplate += `<button type="submit">Buy now</button>`;
      eachVehicleTemplate += `</form>`;
      eachVehicleTemplate += "</div>";
      eachVehicleTemplate += "</li>";
    });
    eachVehicleTemplate += `</ul>`;
  } else {
    eachVehicleTemplate =
      '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return eachVehicleTemplate;
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value='' selected disabled>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * JWT Token Middleware
 * ************************/
Util.checkJWTToken = (req, res, next) => {
    const token = req.cookies.jwt;
    
    if (!token) {
        res.locals.loggedin = false;
        res.locals.accountData = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        res.locals.loggedin = true;
        res.locals.accountData = decoded;
        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        res.clearCookie('jwt');
        res.locals.loggedin = false;
        res.locals.accountData = null;
        next();
    }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

Util.checkRole = (req, res, next) => {
    try {
        // Get JWT token from cookie
        const token = req.cookies.jwt;
        if (!token) {
            req.flash("notice", "Please log in.");
            return res.redirect("/account/login");
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Allow all logged-in users to access cart
        next();
    } catch (error) {
        console.error("Role check error:", error);
        req.flash("notice", "Invalid session. Please log in again.");
        res.clearCookie('jwt');
        return res.redirect("/account/login");
    }
}

/* ****************************************
// JWT Token Middleware
// ************************/
Util.checkJWT = (req, res, next) => {
    try {
        // Get JWT token from cookie
        const token = req.cookies.jwt;
        if (!token) {
            req.flash("notice", "Please log in.");
            return res.redirect("/account/login");
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Store decoded token in request object
        req.decoded = decoded;
        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        req.flash("notice", "Invalid session. Please log in again.");
        res.clearCookie('jwt');
        return res.redirect("/account/login");
    }
};


Util.buildPurchaseSuccessPage = (data) => {
  try {
    let purchaseSuccessPage = `
      <div class="purchase-success-container">
        <h2 class="success-heading">Thank you for your purchase!</h2>
        <p class="success-message">Your purchase has been completed successfully.</p>
        <div class="vehicle-summary">
          <p><strong>Vehicle:</strong> ${data.inv_make} ${data.inv_model} (${data.inv_year})</p>
          <p><strong>Price:</strong> $${new Intl.NumberFormat("en-US").format(data.inv_price)}</p>
          <p><strong>Purchase Date:</strong> ${data.purchase_date}</p>
        </div>
        <p class="thank-you-note">Thank you for shopping with us!</p>
        <a href="/" class="return-home-link">← Back to Home</a>
      </div>
    `;
    return purchaseSuccessPage;
  } catch (error) {
    console.error("Error building purchase success page: " + error.message);
    return "";
  }
};

Util.buildPurchaseHistoryPage = (data) => {
  try {
    let purchaseHistoryPage = `
      <div class="purchase-history-container">
        <h2 class="history-heading">Your Purchase History</h2>
        <div class="purchase-list">
          ${data.length > 0 ? data.map((purchase) => `
            <div class="purchase-item">
              <p class="vehicle-name"><strong>Vehicle:</strong> ${purchase.inv_make} ${purchase.inv_model} (${purchase.inv_year})</p>
              <p class="vehicle-price"><strong>Price:</strong> $${new Intl.NumberFormat("en-US").format(purchase.inv_price)}</p>
              <p class="purchase-date"><strong>Purchase Date:</strong> ${purchase.purchase_date}</p>
              <a href="/" class="return-home-link">← Back to Home</a>
            </div>
          `).join("") : '<p class="no-purchases">You have not made any purchases yet.</p>'}
        </div>
      </div>
    `;
    return purchaseHistoryPage;
  } catch (error) {
    console.error("Error building purchase history page: " + error.message);
    return "";
  }
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
module.exports = Util;
