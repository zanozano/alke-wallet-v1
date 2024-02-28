const pool = require('./pool');

async function getUsers() {
    try {
        const query = 'SELECT * FROM users';
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

async function postUser(email, first_name, last_name, password) {

    try {
        const query = `
		INSERT INTO users (email, first_name, last_name, password)
		VALUES ($1, $2, $3, $4)
		RETURNING *`;
        const values = [email, first_name, last_name, password];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error in postUser:', error);
        throw error;
    }
}

async function putStatusUser(id, validate) {
    try {
        const query = `UPDATE users SET validate = $1 WHERE id = $2 RETURNING *`;
        const values = [validate, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error in putStatusUser:', error);
        throw error;
    }
}

async function getLogin(email, password) {
    try {
        const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
        const values = [email, password];
        const result = await pool.query(query, values);
        return result.rows[0];
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

module.exports = { getUsers, postUser, putStatusUser, getLogin, putUser, deleteUser };
