const pool = require("../database");


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function updateAccount(accountData) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    const result = await pool.query(sql, [accountData.account_firstname, accountData.account_lastname, accountData.account_email, accountData.account_id])
    if (result.rowCount === 0) {
      throw new Error("Account not found or update failed");
    }
    return result.rows[0];
  }
  catch (error) {
    console.error("Error updating account:", error);
    throw new Error("Failed to update account");
  }
}


async function updateAccountPassword(account_id, account_password) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    const result = await pool.query(sql, [account_password, account_id])
    if (result.rowCount === 0) {
      throw new Error("Account not found or password update failed");
    }
    return result.rows[0];
  }
  catch (error) {
    console.error("Error updating account password:", error);
    throw new Error("Failed to update account password");
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updateAccount,
  updateAccountPassword
};