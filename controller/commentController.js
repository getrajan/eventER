const Comment = require('./../model/commentModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../controller/handleFactory');

exports.setEventUsersIds = (req,res,next) => {
    // Allowed nested routes
    if(!req.body.event) req.body.event = req.params.eventId;
    if(!req.body.user) req.body.user = req.user.id;
    
    next();
}

exports.createComment = factory.createOne(Comment);
exports.getAllComments = factory.getAll(Comment);
exports.getComment = factory.getOne(Comment);
exports.editComment = factory.updateOne(Comment);
exports.deleteComment = factory.deleteOne(Comment);