const pool = require('./pool');

async function getUsers() {
    try {
        const query = `
            SELECT
            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.password,
            c.credit_card_number AS credit_card_number,
            c.expiration_date AS credit_card_expiration_date,
            c.cvv AS credit_card_cvv,
            c.balance AS credit_balance,
            s.credit_card_number AS savings_card_number,
            s.expiration_date AS savings_card_expiration_date,
            s.cvv AS savings_card_cvv,
            s.balance AS savings_balance,
            ct.amount AS credit_transaction_amount,
            ct.transaction_type AS credit_transaction_type,
            st.amount AS savings_transaction_amount,
            st.transaction_type AS savings_transaction_type
            FROM
                users u
            LEFT JOIN
                credit_accounts c ON u.id = c.user_id
            LEFT JOIN
                savings_accounts s ON u.id = s.user_id
            LEFT JOIN
                credit_transactions ct ON c.id = ct.credit_account_id
            LEFT JOIN
                savings_transactions st ON s.id = st.savings_account_id;`;

        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

async function getUser(userId) {
    try {
        const query = `
            SELECT 
                u.id AS user_id, 
                u.first_name, 
                u.last_name, 
                u.email,
                u.password,
                c.credit_card_number AS credit_card_number,
                c.expiration_date AS credit_card_expiration_date,
                c.cvv AS credit_card_cvv,
                c.balance AS credit_balance,
                s.credit_card_number AS savings_card_number,
                s.expiration_date AS savings_card_expiration_date,
                s.cvv AS savings_card_cvv,
                s.balance AS savings_balance,
                ct.amount AS credit_transaction_amount,
                ct.transaction_type AS credit_transaction_type,
                st.amount AS savings_transaction_amount,
                st.transaction_type AS savings_transaction_type
            FROM 
                users u
            LEFT JOIN 
                credit_accounts c ON u.id = c.user_id
            LEFT JOIN 
                savings_accounts s ON u.id = s.user_id
            LEFT JOIN
                credit_transactions ct ON c.id = ct.credit_account_id
            LEFT JOIN
                savings_transactions st ON s.id = st.savings_account_id
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

async function newTransaction(account, user, amount, type) {
    try {
        let transactionTable;
        if (account === 'credit') {
            transactionTable = 'credit_transactions';
        } else if (account === 'savings') {
            transactionTable = 'savings_transactions';
        }

        const query = `
            INSERT INTO ${transactionTable} (${account}_account_id, ${account}_transaction_amount, ${account}_transaction_type)
            VALUES ($1, $2, $3)
            RETURNING id`;

        const values = [account === 'credit' ? user.credit_account_id : user.savings_account_id, amount, type];

        const result = await pool.query(query, values);
        return result.rows[0].id;
    } catch (error) {
        console.error('Error in newTransaction:', error);
        throw error;
    }
}



module.exports = { getUsers, getUser, getLogin };
