const Like = require('./../model/likeModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../controller/handleFactory');


exports.setEventUserIds =(req,res,next) =>{
    if(!req.body.event) req.body.event = req.params.eventId;
    if(!req.body.user) req.body.user = req.user.id;

   
    next();
};

exports.filterTrustedUser = catchAsync( async(req,res,next)=>{
    if(!req.body.event) req.body.event = req.params.eventId;
    if(!req.body.user) req.body.user = req.user.id;

    const doc = await Like.findOne({ event: req.body.event, user:req.body.user });
    if(!doc){
        return next(new AppError("You can not dislike. You have no like of this event",404));
    }
    next();
});

exports.createLike = factory.createOne(Like);
exports.getLikes = factory.getAll(Like);
exports.getLike = factory.getOne(Like);
exports.dislike = factory.deleteOne(Like);
