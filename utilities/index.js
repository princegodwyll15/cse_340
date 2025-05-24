const invModel = require("../models/inventory-model");
const Util = {};

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
      eachVehicleTemplate += '<li class="vehicle-detail-item">';
      eachVehicleTemplate += '<div class="vehicle-main">';
      eachVehicleTemplate += `<h1>${inv_vehicle.inv_year} ${inv_vehicle.inv_make} ${inv_vehicle.inv_model}</h1>`;
      eachVehicleTemplate += `<img src="${inv_vehicle.inv_thumbnail}" alt="Image of ${inv_vehicle.inv_year} ${inv_vehicle.inv_make} ${inv_vehicle.inv_model}" class="vehicle-detail-img" />`;
      eachVehicleTemplate += "</div>";
      eachVehicleTemplate += '<div class="vehicle-detail-info">';
      eachVehicleTemplate += `<h3>Name of vehicle: ${inv_vehicle.inv_make} ${inv_vehicle.inv_model}</h3>`;
      eachVehicleTemplate += `<h4>Price: $${new Intl.NumberFormat(
        "en-US"
      ).format(inv_vehicle.inv_price)}</h4>`;
      eachVehicleTemplate += `<p><b>Description:</b> ${inv_vehicle.inv_description}</p>`;
      eachVehicleTemplate += `<p><b>Color:</b> ${inv_vehicle.inv_color}</p>`;
      eachVehicleTemplate += `<p><b>Miles:</b> ${inv_vehicle.inv_miles}</p>`;
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

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
module.exports = Util;
