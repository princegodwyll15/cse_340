const utilities = require("../utilities");
const baseController = {};

baseController.buildHome = async function (req, res) {
  req.flash("notice", "This is a flash message.");
  const nav = await utilities.getNav();
  const message = req.flash("notice");
  const messageType = "success";
  res.render("index", { title: "Home", nav, message, messageType });
};

module.exports = baseController;