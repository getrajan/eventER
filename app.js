const express = require("express");
const morgan = require("morgan");
const multer = require('multer');
const upload = multer();
// const bodyParser = require('body-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const userRoute = require('./routes/userRoute');
const eventRoute = require('./routes/eventRoutes');

const app = express();


// 1. MIDDLEWARE
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
}
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

// for parsing application/json
app.use(express.json());

// for parsing multipart/form-data
// app.use(upload.none()); 
app.use(express.static('public'));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});


// 2. ROUTES
app.use('/api/v1/users', userRoute);
app.use('/api/v1/events',eventRoute);

// handle undefined routers
app.all('*', (req, res, next) => {

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});


app.use(globalErrorHandler);


module.exports = app;