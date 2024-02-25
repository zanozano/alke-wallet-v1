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

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', userRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
