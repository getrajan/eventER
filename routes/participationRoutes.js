const express = require('express');
const participationController = require('./../controller/participationController');

const router = express.Router( { mergeParams:true } );

 
router.route('/')
    .post(participationController.selectEventUserIds,participationController.createParticipate);

router.route('/:id').patch(participationController.selectEventUserIds,participationController.editParticipation)
        .get(participationController.getParticipation)
        .delete(participationController.cancelParticipation);

module.exports = router;    