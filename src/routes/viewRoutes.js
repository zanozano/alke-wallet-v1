const express = require('express');
const router = express.Router();
const { getUsers, getUserTransactions } = require('../services/request');

const Handlebars = require('handlebars');
const { format } = require('date-fns');

Handlebars.registerHelper('isActive', function (url, currentUrl) {
    return currentUrl === url ? 'active' : '';
});

Handlebars.registerHelper('formatDate', function (date) {
    return format(date, 'dd-MM-yyyy');
});

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
};

router.get('/', async (req, res) => {
    try {
        const user = req.session.user;
        res.render('Home', { user, layout: 'main' });
    } catch (error) {
        handleError(res, error);
    }
});

router.get('/login', async (req, res) => {
    try {
        res.render('Login', { layout: 'main' });
    } catch (error) {
        handleError(res, error);
    }
});

router.get('/create', async (req, res) => {
    try {
        res.render('Create', { layout: 'main' });
    } catch (error) {
        handleError(res, error);
    }
});

router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const userTransaction = await getUserTransactions(user.user_id);
        res.render('Profile', { user, userTransaction, layout: 'main', currentUrl: req.originalUrl });
    } catch (error) {
        handleError(res, error);
    }
});


router.get('/transfer', isAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const allUsers = await getUsers();
        res.render('Transfer', { user, allUsers, layout: 'main', currentUrl: req.originalUrl });
    } catch (error) {
        handleError(res, error);
    }
});

router.get('/settings', isAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        res.render('Settings', { user, layout: 'main', currentUrl: req.originalUrl });
    } catch (error) {
        handleError(res, error);
    }
});

function handleError(res, error) {
    console.error(`Error: ${error}`);
    res.status(500).send({
        error: `Something went wrong... ${error}`,
        code: 500,
    });
}

module.exports = router;
