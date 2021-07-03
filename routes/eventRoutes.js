const express = require('express');
const authController = require('./../controller/authController');
const eventController = require('./../controller/eventController');
const commentRoutes = require('./../routes/commentRoutes');
const pariticipateRoutes =require('./../routes/participationRoutes');
const likeRoutes = require('./../routes/likeRoutes');

const router = express.Router();

// Protect all the routes
router.use(authController.protect);

/*
nested routes for comment of an event
POST  /event/eventId/comment 
GET /event/eventId/comment => all comments of an event
Get  /event/eventId/comment/commentId => get specific comment of an event
*/
router.use('/:eventId/comments',commentRoutes);

// nested route for participation of an event
router.use('/:eventId/participates',pariticipateRoutes);

// nested route for like of an event
router.use('/:eventId/likes',likeRoutes);

router.route('/top-5-long-events').get(eventController.aliasTopEvents,eventController.getEvents);

router.route('/')
    .post(eventController.uploadEventImages, eventController.resizeEventImages,eventController.createEvent)
    .get(authController.protect,eventController.getEvents);

router.route('/:id')
    .get(eventController.getEvent)
    .patch(eventController.restrictEvent("admin"),eventController.uploadEventImages,eventController.resizeEventImages,eventController.updateEvent)
    .delete(authController.restrictTo("admin"),eventController.deleteEvent);




module.exports = router;