const express = require('express');
const authController = require('./../controller/authController');
const userController = require('./../controller/userController');

const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword',authController.protect,authController.updatePassword);

router.patch('/updateMe',authController.protect,userController.uploadUserImages,userController.resizeUserImages,userController.updateMe);
router.patch('/deleteMe',authController.protect,userController.deleteMe);

router.get('/me',authController.protect,userController.getMe,userController.getUser);
router.get('/',authController.protect,userController.getAllUsers);
router.get('/:id',authController.protect,userController.getUser);


module.exports = router;