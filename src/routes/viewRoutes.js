const express = require('express');
const router = express.Router();

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

router.get('/profile', async (req, res) => {
    try {
        res.render('Profile', { layout: 'main' });
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
