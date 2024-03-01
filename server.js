const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const userRoutes = require('./src/routes/viewRoutes');
const config = require('./config');
const PORT = config.port;
const session = require('express-session');

const jwt = require('jsonwebtoken');
const secretKey = config.secretKey;

app.use(
    session({
        secret: secretKey,
        resave: false,
        saveUninitialized: true,
    })
);

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.isAuthenticated = true;
    } else {
        res.locals.isAuthenticated = false;
    }
    next();
};

app.use(isAuthenticated);

const { getUser, getUsers, postUser, getLogin, putUser, deleteUser, } = require('./src/services/request');

const handlebarsHelpers = require('handlebars-helpers')();
const customHelpers = {
    eq: function (a, b) {
        return a === b;
    },
};

app.engine(
    'handlebars',
    engine({
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, 'src/views/layouts'),
        partialsDir: path.join(__dirname, 'src/views/partials'),
        helpers: {
            ...handlebarsHelpers,
            ...customHelpers,
            isAuthenticated: function () {
                return res.locals.isAuthenticated;
            },
        },
    })
);

app.use((req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.isAuthenticated = true;
    } else {
        res.locals.isAuthenticated = false;
    }
    next();
});

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', userRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/users', async (req, res) => {
    const data = await getUsers();
    res.send(data);
});

app.post('/verify', async (req, res) => {
    const { email, password } = req.body;
    if (email === '' || password === '') {
        res.status(401).send({
            error: 'Please fill out all the fields',
            code: 401,
        });
    } else {
        const user = await getLogin(email, password);
        console.log(user)
        if (user) {
            const userData = await getUser(user.id);
            if (userData) {
                req.session.user = userData;
                const token = jwt.sign(
                    {
                        exp: Math.floor(Date.now() / 1000) + 180,
                        data: userData,
                    },
                    secretKey
                );
                res.send(token);
            } else {
                res.status(500).send({
                    error: 'Failed to retrieve user data',
                    code: 500,
                });
            }
        } else {
            res.status(404).send({
                error: 'This user is not registered, or the password is incorrect',
                code: 404,
            });
        }
    }
});

app.post('/create', async (req, res) => {
    const { first_name, last_name, email, password, repeat_password } = req.body;

    if (!first_name || !last_name || !email || !password || !repeat_password ||
        typeof first_name !== 'string' || typeof last_name !== 'string' || typeof email !== 'string' ||
        typeof password !== 'string' || typeof repeat_password !== 'string') {
        res.status(400).json({ success: false, message: 'All fields are required' });
        return;
    }

    if (password !== repeat_password) {
        res.status(400).json({ success: false, message: 'Passwords do not match' });
    } else {
        try {

            const newUser = await postUser(first_name, last_name, email, password);

            if (newUser) {
                console.log('INSERT NEW USER', newUser);
                res.status(200).json({ success: true, message: 'Registration successful' });
            } else {
                res.status(500).json({ success: false, message: 'Error inserting user' });
            }
        } catch (error) {
            console.error('Error in route handler:', error);
            res.status(500).json({ success: false, message: `Something went wrong... ${error.message}` });
        }
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send('OK');
        }
    });
});
