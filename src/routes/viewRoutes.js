const express = require('express');
const router = express.Router();
const Handlebars = require('handlebars');
Handlebars.registerHelper('isActive', function (url, currentUrl) {
    return currentUrl === url ? 'active' : '';
});

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/signin');
    }
};

router.get('/', async (req, res) => {
    try {
        res.render('Home', { layout: 'main' });
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
        res.render('Profile', { user, layout: 'main', currentUrl: req.originalUrl });
    } catch (error) {
        handleError(res, error);
    }
});

router.get('/transfer', isAuthenticated, async (req, res) => {
    try {
        res.render('Transfer', { layout: 'main', currentUrl: req.originalUrl });
    } catch (error) {
        handleError(res, error);
    }
});

router.get('/settings', isAuthenticated, async (req, res) => {
    try {
        res.render('Settings', { layout: 'main', currentUrl: req.originalUrl });
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
