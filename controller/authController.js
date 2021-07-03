const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../model/userModel');
const sendMail = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
        // expiresIn:"5s"
    });
}


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token: token,
        data: {
            user
        }
    })

}

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    });

    createSendToken(newUser, 201, res);
});


exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. check if email and password exist
    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    // 2. Check if user exist and password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    // 3. If everything is okey,send token to client
    createSendToken(user, 200, res);
});


exports.protect = catchAsync(async (req, res, next) => {

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
        }
        if (process.env.NODE_ENV == 'production') cookieOptions.secure = true;
        res.cookie('jwt', token, cookieOptions);
    }

    if (!token) {
        return next(new AppError("You are not logged in, Please login in..", 401));
    }

    // verification token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("The user beloging to this id doesn'nt exist", 401));
    }


    // check user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed password! Please login again", 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();

});


exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1. Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("There is no user with this email", 404));
    }

    // 2. Generate the random reset token 
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });


    // send it to user's mail
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendMail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message: message,
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending the email. Try again later!', 500));
    }

})


exports.resetPassword = catchAsync(async (req, res, next) => {
    //1. Get user based on the token
    const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken:hashToken,
        passwordResetExpires:{ $gt: Date.now()}
    });

    // 2. If token has not expire, and there is user, set the new password
    if(!user){
        return next(new AppError("Token is invalid or has expired",400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3. Update changePasswordAt property for the user
    // 4. Log ther user in, send JWT
    createSendToken(user,200,res);
});

exports.updatePassword = catchAsync(async (req,res,next)=>{
    const {currentPassword,password,confirmPassword}=req.body;
    // 1. Get user from collection 
    const user = await User.findById(req.user.id).select('+password');
    console.log(`data ${req.user.id}=>${req.body.password}`);
    // 2. Check if POSTed user password is correct
    if(!(await user.correctPassword(currentPassword,user.password))){
        return next(new AppError("Your password is wrong",401));
    }   

    // 3. If so, update password
    user.password = password;
    user.confirmPassword = confirmPassword;
    await user.save();

    // 4. Log user in, Send JWT
    createSendToken(user,200,res);
});

exports.restrictTo = (...roles) =>{
    return (req,res,next) =>{
        if(!roles.includes(req.user.role)){
            return next(new AppError("You don't have permission to perform this action",403));
        }
        next();
    }
}

