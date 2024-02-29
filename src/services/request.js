const pool = require('./pool');

async function getUsers() {
    try {
        const query = `
            SELECT 
                u.id AS user_id, 
                u.first_name, 
                u.last_name, 
                u.email, 
                c.credit_card_number AS credit_card_number,
                c.expiration_date AS credit_card_expiration_date,
                c.cvv AS credit_card_cvv,
                c.balance AS credit_balance,
                s.credit_card_number AS savings_card_number,
                s.expiration_date AS savings_card_expiration_date,
                s.cvv AS savings_card_cvv,
                s.balance AS savings_balance
            FROM 
                users u
            LEFT JOIN 
                credit_accounts c ON u.id = c.user_id
            LEFT JOIN 
                savings_accounts s ON u.id = s.user_id`;

        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

async function getUserData(userId) {
    try {
        const query = `
            SELECT 
                u.id AS user_id, 
                u.first_name, 
                u.last_name, 
                u.email, 
                c.credit_card_number AS credit_card_number,
                c.expiration_date AS credit_card_expiration_date,
                c.cvv AS credit_card_cvv,
                c.balance AS credit_balance,
                s.credit_card_number AS savings_card_number,
                s.expiration_date AS savings_card_expiration_date,
                s.cvv AS savings_card_cvv,
                s.balance AS savings_balance
            FROM 
                users u
            LEFT JOIN 
                credit_accounts c ON u.id = c.user_id
            LEFT JOIN 
                savings_accounts s ON u.id = s.user_id
            WHERE
                u.id = $1`;
        const values = [userId];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

async function postUser(first_name, last_name, email, password) {

    try {
        const query = `
		INSERT INTO users (first_name, last_name, email, password)
		VALUES ($1, $2, $3, $4)
		RETURNING *`;
        const values = [first_name, last_name, email, password];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error in postUser:', error);
        throw error;
    }
}

async function getLogin(email, password) {
    try {
        const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
        const values = [email, password];
        const result = await pool.query(query, values);
        const user = result.rows[0];
        if (user) {
            console.log(user);
            return user;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error in getLogin:', error);
        throw error;
    }
}


async function putUser(first_name, last_name, password, email,) {
    try {
        const query = `
            UPDATE users
            SET
                first_name = $1,
                last_name = $2,
                password = $3,
            WHERE email = $4
            RETURNING *`;
        const values = [first_name, last_name, password, email,];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.log('Error: ', error);
    }
}

async function deleteUser(email) {
    try {
        const query = 'DELETE FROM users WHERE email = $1';
        const values = [email];
        const result = await pool.query(query, values);
        return result.rowCount;
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    }
}

module.exports = { getUsers, getUserData, postUser, getLogin, putUser, deleteUser };
