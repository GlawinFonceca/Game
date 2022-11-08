const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: './config/.env' });

const router = require('./routes/user');
const pageRouter = require('./routes/page');
const gameRouter = require('./routes/game');
const { handlebars } = require('hbs');

const viewPath = path.join(__dirname, '../Game/views');
const headerPath = path.join(__dirname, '../Game/views/partials');

app.set('view engine', 'hbs');
app.set('views', viewPath);
hbs.registerPartials(headerPath);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(viewPath));

//ROUTES REALTED CODE
app.use(router);
app.use(pageRouter);
app.use(gameRouter);

handlebars.registerHelper('ifEquals', function(arg1, arg2, options) { 
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);

});

app.listen(process.env.PORT, () => {
    console.log('server is up on port ', process.env.PORT);
});




