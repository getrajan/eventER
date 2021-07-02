const express = require('express');
const authController = require('./../controller/authController');
const eventController = require('./../controller/eventController');

const router = express.Router();

router.route('/top-5-long-events').get(authController.protect,
                            eventController.aliasTopEvents,
                            eventController.getEvents)

router.post('/create',authController.protect,
                    eventController.uploadEventImages,
                    eventController.resizeEventImages,
                    eventController.createEvent);

router.get('/',authController.protect,eventController.getEvents);

router.patch('/update/:id',authController.protect,
                        eventController.uploadEventImages,
                        eventController.resizeEventImages,
                        eventController.updateEvent);

module.exports = router;