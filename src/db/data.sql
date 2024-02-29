CREATE DATABASE alkewallet;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
--
CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    credit_card_number VARCHAR(16),
    expiration_date DATE,
    cvv VARCHAR(3),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
--
CREATE TABLE savings_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    credit_card_number VARCHAR(16),
    expiration_date DATE,
    cvv VARCHAR(3),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
--
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_account_id UUID,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    -- 'deposit', 'withdrawal', 'transfer_in', 'transfer_out'
    reference_id UUID,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_account_id) REFERENCES credit_accounts(id)
);
--
CREATE TABLE savings_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    savings_account_id UUID,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    -- 'deposit', 'withdrawal', 'transfer_in', 'transfer_out'
    reference_id UUID,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (savings_account_id) REFERENCES savings_accounts(id)
);
--
INSERT INTO users (first_name, last_name, email, password)
VALUES (
        'Cristobal',
        'Manzano',
        'cristobal@alkewallet.com',
        '123456'
    );
--
SELECT id INTO new_user_id
FROM users
ORDER BY id DESC
LIMIT 1;
--
INSERT INTO credit_accounts (
        user_id,
        balance,
        credit_card_number,
        expiration_date,
        cvv
    )
SELECT u.id AS user_id,
    100000 AS balance,
    (
        SELECT STRING_AGG(FLOOR(RANDOM() * 10)::TEXT, '')
        FROM GENERATE_SERIES(1, 16)
    ) AS credit_card_number,
    CURRENT_DATE + INTERVAL '1 year' * (FLOOR(RANDOM() * 10) + 1) AS expiration_date,
    (
        SELECT STRING_AGG(FLOOR(RANDOM() * 10)::TEXT, '')
        FROM GENERATE_SERIES(1, 3)
    ) AS cvv
FROM users u;
INSERT INTO savings_accounts (
        user_id,
        balance,
        credit_card_number,
        expiration_date,
        cvv
    )
SELECT u.id AS user_id,
    100000 AS balance,
    (
        SELECT STRING_AGG(FLOOR(RANDOM() * 10)::TEXT, '')
        FROM GENERATE_SERIES(1, 16)
    ) AS credit_card_number,
    CURRENT_DATE + INTERVAL '1 year' * (FLOOR(RANDOM() * 10) + 1) AS expiration_date,
    (
        SELECT STRING_AGG(FLOOR(RANDOM() * 10)::TEXT, '')
        FROM GENERATE_SERIES(1, 3)
    ) AS cvv
FROM users u;
--
SELECT u.id AS user_id,
    u.first_name,
    u.last_name,
    u.email,
    c.id AS credit_account_id,
    c.balance AS credit_balance,
    c.credit_card_number AS credit_card,
    c.expiration_date AS credit_expiration_date,
    c.cvv AS credit_cvv,
    s.id AS savings_account_id,
    s.balance AS savings_balance,
    s.credit_card_number AS savings_credit_card,
    s.expiration_date AS savings_expiration_date,
    s.cvv AS savings_cvv
FROM users u
    LEFT JOIN credit_accounts c ON u.id = c.user_id
    LEFT JOIN savings_accounts s ON u.id = s.user_id;
