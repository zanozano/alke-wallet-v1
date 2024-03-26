const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres.zcjrpoenrhofsuvsqzni',
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    password: process.env.PASSWORD_DB,
    database: 'postgres',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(client => {
        console.log('Connected to the database');
        client.release();
    })
    .catch(error => {
        console.error('Error connecting to the database:', error);
    });

module.exports = pool;
