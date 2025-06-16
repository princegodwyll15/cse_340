const pool = require("../database");


async function buyVehicle(inv_id, account_id) {
    try {
        // First, insert the purchase record
        const insertSql = `
            INSERT INTO public.purchase (inv_id, account_id)
            VALUES ($1, $2)
            RETURNING purchased_id, purchase_date
        `;
        const insertResult = await pool.query(insertSql, [inv_id, account_id]);
        
        if (!insertResult.rows[0]) {
            throw new Error("Failed to record purchase");
        }

        // Then, get the purchase details
        const selectSql = `
            SELECT 
                p.purchased_id,
                p.account_id,
                a.account_firstname,
                a.account_lastname,
                i.inv_make,
                i.inv_model,
                i.inv_year,
                i.inv_description,
                i.inv_price,
                p.purchase_date
            FROM public.purchase p
            JOIN public.inventory i ON p.inv_id = i.inv_id
            JOIN public.account a ON p.account_id = a.account_id
            WHERE p.purchased_id = $1
        `;
        
        const result = await pool.query(selectSql, [insertResult.rows[0].purchased_id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error in buyVehicle: " + error.message);
        throw error;
    }
}


async function getPurchaseHistory(account_id) {
    try {
        const selectSql = `
            SELECT 
                p.purchased_id,
                p.account_id,
                a.account_firstname,
                a.account_lastname,
                i.inv_make,
                i.inv_model,
                i.inv_year,
                i.inv_description,
                i.inv_price,
                p.purchase_date
            FROM public.purchase p
            JOIN public.inventory i ON p.inv_id = i.inv_id
            JOIN public.account a ON p.account_id = a.account_id
            WHERE p.account_id = $1
        `;
        
        const result = await pool.query(selectSql, [account_id]);
        return result.rows;
    } catch (error) {
        console.error("Error in getPurchaseHistory: " + error.message);
        throw error;
    }
}

module.exports = {
    buyVehicle,
    getPurchaseHistory,
}
    
