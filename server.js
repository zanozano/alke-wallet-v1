const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const userRoutes = require('./src/routes/viewRoutes');
const config = require('./config');
const PORT = config.port;

app.engine(
    'handlebars',
    engine({
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, 'src/views/layouts'),
        partialsDir: path.join(__dirname, 'src/views/partials'),
    })
);

const { getUsers, postUser, putStatusUser, getLogin, putUser, deleteUser, } = require('./src/services/request');

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', userRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



app.post('/create', async (req, res) => {
    const { first_name, last_name, email, password, repeat_password } = req.body;

    if (!first_name || !last_name || !email || !password || !repeat_password ||
        typeof first_name !== 'string' || typeof last_name !== 'string' || typeof email !== 'string' ||
        typeof password !== 'string' || typeof repeat_password !== 'string') {
        res.status(400).json({ success: false, message: 'All fields are required and must be non-empty strings' });
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
