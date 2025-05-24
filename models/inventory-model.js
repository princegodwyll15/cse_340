const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

async function getInventoryDetailsByInvId(inv_id) {
  try {
    console.log("Querying for inv_id:", inv_id); // Add this line
    const data = await pool.query(
      `SELECT inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
       FROM public.inventory
       WHERE inv_id = $1`,
      [inv_id]
    );
    console.log("Query result:", data.rows); // Add this line
    return data.rows;
  } catch (error) {
    console.error("getInventoryDetialsByInvId " + error);
  }
}
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryDetailsByInvId,
};
