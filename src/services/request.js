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

async function getTransactions() {
    try {
        const query = `
            SELECT
                'credit' AS account_type,
                c.id,
                c.amount,
                c.transaction_type,
                c.timestamp,
                ca.credit_card_number AS card_number
            FROM
                credit_transactions c
            LEFT JOIN
                credit_accounts ca ON c.credit_account_id = ca.id

            UNION ALL

            SELECT
                'savings' AS account_type,
                s.id,
                s.amount,
                s.transaction_type,
                s.timestamp,
                sa.credit_card_number AS card_number
            FROM
                savings_transactions s
            LEFT JOIN
                savings_accounts sa ON s.savings_account_id = sa.id

            ORDER BY
                timestamp DESC
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
        let transactionTable;
        let transactionType;

        if (type === 'deposit') {
            transactionType = 'deposit';
        } else if (type === 'withdrawal') {
            transactionType = 'withdrawal';
        } else {
            throw new Error('Invalid transaction type');
        }

        if (account === 'credit') {
            transactionTable = 'credit_transactions';
        } else if (account === 'savings') {
            transactionTable = 'savings_transactions';
        } else {
            throw new Error('Invalid account type');
        }

        let accountId;
        if (account === 'credit') {
            const user = await getUser(giver);
            accountId = user.credit_account_id;
        } else if (account === 'savings') {
            const user = await getUser(giver);
            accountId = user.savings_account_id;
        }

        const query = `
            INSERT INTO ${transactionTable} (${account}_account_id, amount, transaction_type)
            VALUES ($1, $2, $3)
            RETURNING id`;

        const values = [accountId, amount, transactionType];

        const result = await pool.query(query, values);
        return result.rows[0].id;
    } catch (error) {
        console.error('Error in newTransaction:', error);
        throw error;
    }
}






module.exports = { getUsers, getUser, getLogin, newTransaction, getTransactions };
