const AppError = require('./../utils/appError');
const handleCastErrorDB = err =>{
    const message = `Invalid ${err.path} with value ${err.value} `;
    return new AppError(message,400);
}

const handleDuplicateFieldsDB = err =>{
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value ${value}. Please use another value`;
    return new AppError(message,400);
}

const handleValidationErrorDB = err =>{
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join(', ')}`;
    return new AppError(message,400);
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
}

const sendErrorProd = (err, res) => {

    // operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });

        // programming or other unknown error: don't leak error detail to client
    }
     else {
    //     // 1. logged error
        // console.error("ERROR ", err);

    //     // 2. send generic message
        res.status(500).json({
            status: "error",
            message: "Something went wrong",
            err
        });
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV ==='production') {
        
        let error ={ ...err };
        if(err.name === "CastError") error = handleCastErrorDB(err);
        if(err.code === 11000) error = handleDuplicateFieldsDB(err);
        if(err.name === "ValidationError") error = handleValidationErrorDB(err);

        sendErrorProd(error, res);
    }

}