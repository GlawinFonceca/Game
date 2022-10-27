const express = require('express');
const path = require('path');
const hbs = require('hbs')
const bodyParser = require('body-parser');
const app = express()
const cookieParser = require('cookie-parser')
require('dotenv').config({path: './config/.env'})


require('./database/connection');
const router = require('./routes/user')



const viewPath = path.join(__dirname, '../GAME/views');
const headerPath = path.join(__dirname, '../GAME/views/partials');

app.set('view engine', 'hbs')
app.set('views', viewPath);
hbs.registerPartials(headerPath);

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(viewPath))

//ROUTES REALTED CODE
app.use(router);


app.listen(port, () => {
    console.log('server is up on port ',process.env.PORT);
})




