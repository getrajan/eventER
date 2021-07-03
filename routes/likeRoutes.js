const express = require('express');
const likeController = require('./../controller/likeController');
const authController = require('./../controller/authController');

const router = express.Router( {mergeParams: true });

router.route('/').post(likeController.setEventUserIds,likeController.createLike)
        .get(likeController.getLikes);

router.route('/:id')
    .get(likeController.getLike)
    .delete(likeController.filterTrustedUser,likeController.dislike);

module.exports = router;