const Participation = require('./../model/participationsModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../controller/handleFactory');

exports.selectEventUserIds = (req,res,next)=>{
    if(!req.body.event) req.body.event = req.params.eventId;
    if(!req.body.user) req.body.user = req.user.id;
    
    next();
}
exports.createParticipate = factory.createOne(Participation);
exports.getParticipation = factory.getOne(Participation);


exports.editParticipation = catchAsync( async (req,res,next)=>{
    if(!req.body.event) req.body.event = req.params.eventId;
    if(!req.body.user) req.body.user = req.user.id;

    const participate = await Participation.findByIdAndUpdate(req.params.id,req.body ,{
        new:true,
        runValidators: true,
    });
    if(!participate){
        return next(new AppError("No participate with this id",404));
    }

    res.status(200).json({
        status:'success',
        message: 'updated successfully',
        data:{
            data:participate
        }
    });

});

exports.cancelParticipation = catchAsync( async (req,res,next) => {
    if(!req.body.event) req.body.event = req.params.eventId;
    if(!req.body.user) req.body.user = req.user.id;

    const participation = await Participation.findByIdAndDelete(req.params.id);

    if(!participation){
        return next(new AppError("No participation found with this ID",404));
    }

    res.status(204).json({
        status:'success',
        message: 'Participation cancelled successfully',
        data:null
    });

});