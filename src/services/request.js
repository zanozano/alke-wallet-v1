const pool = require('./pool');

async function getUsers() {
    try {
        const query = `
           SELECT DISTINCT
                u.id AS user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.password,
                c.id AS credit_account_id,
                c.credit_card_number AS credit_card_number,
                c.expiration_date AS credit_card_expiration_date,
                c.cvv AS credit_card_cvv,
                c.balance AS credit_balance,
                s.id AS savings_account_id,
                s.balance AS savings_balance
            FROM
                users u
            LEFT JOIN
                credit_accounts c ON u.id = c.user_id
            LEFT JOIN
                savings_accounts s ON u.id = s.user_id
            LEFT JOIN
                credit_transactions_history cth ON c.id = cth.account_id
            LEFT JOIN
                savings_transactions_history sth ON s.id = sth.account_id;`;
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
                c.id AS credit_account_id,
                c.credit_card_number,
                c.expiration_date AS credit_card_expiration_date,
                c.cvv AS credit_card_cvv,
                c.balance AS credit_balance,
                s.id AS savings_account_id,
                s.savings_card_number,
                s.expiration_date AS savings_card_expiration_date,
                s.cvv AS savings_card_cvv,
                s.balance AS savings_balance,
                'credit' AS credit_transaction_account_type,
                'savings' AS savings_transaction_account_type
            FROM
                users u
            LEFT JOIN
                credit_accounts c ON u.id = c.user_id
            LEFT JOIN
                savings_accounts s ON u.id = s.user_id
            LEFT JOIN
                credit_transactions_history ct ON c.id = ct.account_id
            LEFT JOIN
                savings_transactions_history st ON s.id = st.account_id
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

async function getUserTransactions(userId) {

    try {
        const query = `
            SELECT
                'credit' AS account_type,
                cth.id AS transaction_id,
                cth.transaction_type,
                cth.amount,
                cth.transaction_date,
                ca.credit_card_number AS card_number,
                u.first_name,
                u.last_name,
                u.email
            FROM
                credit_transactions_history cth
            INNER JOIN
                credit_accounts ca ON cth.account_id = ca.id
            INNER JOIN
                users u ON ca.user_id = u.id
            WHERE
                u.id = $1

            UNION ALL

            SELECT
                'savings' AS account_type,
                sth.id AS transaction_id,
                sth.transaction_type,
                sth.amount,
                sth.transaction_date,
                sa.savings_card_number AS card_number,
                u.first_name,
                u.last_name,
                u.email
            FROM
                savings_transactions_history sth
            INNER JOIN
                savings_accounts sa ON sth.account_id = sa.id
            INNER JOIN
                users u ON sa.user_id = u.id
            WHERE
                u.id = $1

            ORDER BY
                transaction_date DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        throw error;
    }
}

async function getUserAssets(userId) {
    try {
        const query = `
            SELECT
                a.asset_name,
                a.asset_quantity,
                a.asset_type,
                a.asset_value
            FROM
                assets a
            WHERE
                a.user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching user assets:', error);
        throw error;
    }
}


async function getAllTransactions() {
    try {
        const query = `
            SELECT
                'credit' AS account_type,
                cth.id AS transaction_id,
                cth.transaction_type,
                cth.amount,
                cth.transaction_date,
                ca.credit_card_number AS card_number,
                u.first_name,
                u.last_name,
                u.email
            FROM
                credit_transactions_history cth
            INNER JOIN
                credit_accounts ca ON cth.account_id = ca.id
            INNER JOIN
                users u ON ca.user_id = u.id

            UNION ALL

            SELECT
                'savings' AS account_type,
                sth.id AS transaction_id,
                sth.transaction_type,
                sth.amount,
                sth.transaction_date,
                sa.savings_card_number AS card_number,
                u.first_name,
                u.last_name,
                u.email
            FROM
                savings_transactions_history sth
            INNER JOIN
                savings_accounts sa ON sth.account_id = sa.id
            INNER JOIN
                users u ON sa.user_id = u.id

            ORDER BY
                transaction_date DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

async function newTransaction(giver, account, receiver, amount, type) {
    try {
        const accountId = giver;
        const transactionType = type;
        const moneyAmount = amount;

        let tableName;

        if (account === 'credit') {
            tableName = 'credit_transactions_history';
        } else if (account === 'savings') {
            tableName = 'savings_transactions_history';
        } else {
            throw new Error('Invalid account type');
        }

        const query = `
            INSERT INTO ${tableName} (account_id, transaction_type, amount)
            VALUES ($1, $2, $3)
            RETURNING id`;

        const values = [accountId, transactionType, moneyAmount];

        const result = await pool.query(query, values);
        return result.rows[0].id;
    } catch (error) {
        console.error('Error in newTransaction:', error);
        throw error;
    }
}






module.exports = { getUsers, getUser, getLogin, newTransaction, getUserTransactions, getUserAssets, getAllTransactions };
