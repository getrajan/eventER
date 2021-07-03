const express = require('express');
const authController = require('./../controller/authController');
const userController = require('./../controller/userController');

const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword',authController.protect,authController.updatePassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMe',authController.protect,userController.uploadUserImages,userController.resizeUserImages,userController.updateMe);
router.patch('/deleteMe',authController.protect,userController.deleteMe);
router.get('/me',authController.protect,userController.getMe,userController.getUser);

// Restrict to
router.use(authController.restrictTo("admin"));
router.get('/',authController.protect,userController.getAllUsers);
router.route('/').get(userController.getAllUsers)
        .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);
// router.get('/:id',authController.protect,userController.getUser);
// router.patch('/:id',userController.updateUser);
// router.delete('/:id',userController.deleteUser);


module.exports = router;