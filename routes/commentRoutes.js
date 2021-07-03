const express = require('express');
const authController = require('./../controller/authController');
const commentController = require('./../controller/commentController');

const router = express.Router({mergeParams:true});

// protect middleware
// router.use(authController.protect);

router.route('/')
    .get(commentController.getAllComments)
    .post(commentController.setEventUsersIds,authController.restrictTo('user'),commentController.createComment);

router.route('/:id')
    .get(commentController.getComment)
    .patch(commentController.editComment)
    .delete(authController.restrictTo('user','admin'),commentController.deleteComment);

module.exports = router;