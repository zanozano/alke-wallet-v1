CREATE DATABASE alkewallet;
--
DROP TABLE IF EXISTS credit_transactions_history,
savings_transactions_history,
credit_accounts,
savings_accounts,
users;
--
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
--
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    asset_quantity DECIMAL(15, 2) NOT NULL DEFAULT 0,
    asset_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    purchase_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- 
--
INSERT INTO assets (
        user_id,
        asset_name,
        asset_quantity,
        asset_type,
        asset_value
    )
VALUES (
        '6c450e05-5146-4f1d-bad4-f9e2ca6bc79c',
        'BTC',
        20,
        'Cryptocurrency',
        20000.00
    ),
    (
        '6c450e05-5146-4f1d-bad4-f9e2ca6bc79c',
        'Gold',
        1,
        'Precious Metal',
        10000.00
    ),
    (
        '6c450e05-5146-4f1d-bad4-f9e2ca6bc79c',
        'ETH',
        15,
        'Cryptocurrency',
        15000.00
    ),
    (
        '6c450e05-5146-4f1d-bad4-f9e2ca6bc79c',
        'XRP',
        1000,
        'Cryptocurrency',
        1000.00
    );
--
CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    credit_card_number VARCHAR(16),
    expiration_date DATE,
    cvv VARCHAR(3)
);
-- 
CREATE TABLE credit_transactions_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES credit_accounts(id) ON DELETE CASCADE
);
-- 
CREATE TABLE savings_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    savings_card_number VARCHAR(16),
    expiration_date DATE,
    cvv VARCHAR(3)
);
-- 
CREATE TABLE savings_transactions_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES savings_accounts(id) ON DELETE CASCADE
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
INSERT INTO users (first_name, last_name, email, password)
VALUES (
        'John',
        'Doe',
        'john@alkewallet.com',
        '123456'
    );
--
DO $$
DECLARE user_record RECORD;
BEGIN FOR user_record IN
SELECT *
FROM users LOOP
INSERT INTO credit_accounts (
        user_id,
        balance,
        credit_card_number,
        expiration_date,
        cvv
    )
VALUES (
        user_record.id,
        100000,
        (
            SELECT STRING_AGG(FLOOR(RANDOM() * 10)::TEXT, '')
            FROM GENERATE_SERIES(1, 16)
        ),
        CURRENT_DATE + INTERVAL '1 year' * (FLOOR(RANDOM() * 10) + 1),
        (
            SELECT STRING_AGG(FLOOR(RANDOM() * 10)::TEXT, '')
            FROM GENERATE_SERIES(1, 3)
        )
    );
-- 
INSERT INTO savings_accounts (
        user_id,
        balance,
        savings_card_number,
        expiration_date,
        cvv
    )
VALUES (
        user_record.id,
        100000,
        (
            SELECT STRING_AGG(FLOOR(RANDOM() * 10)::TEXT, '')
            FROM GENERATE_SERIES(1, 16)
        ),
        CURRENT_DATE + INTERVAL '1 year' * (FLOOR(RANDOM() * 10) + 1),
        (
            SELECT STRING_AGG(FLOOR(RANDOM() * 10)::TEXT, '')
            FROM GENERATE_SERIES(1, 3)
        )
    );
END LOOP;
END $$;
--
SELECT *
FROM credit_accounts;
--
SELECT *
FROM savings_accounts;
--
SELECT *
FROM credit_transactions_history;
--
SELECT *
FROM savings_transactions_history;
