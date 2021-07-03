const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

const createdMessage = model =>`${model} is created successfully`;
const updatedMessage = model => `${model} is updated successfully`;
const getAllMessage = model => `${model}s are displayed successfully`
    


exports.createOne = Model => catchAsync( async (req,res,next)=>{
    console.log('********body',req.body);
    const doc = await Model.create(req.body);
    if(doc.constructor.modelName==="Event"){
        doc.createdBy = req.user.id;
    }
    res.status(201).json({
        status:"success",
        message:createdMessage(doc.constructor.modelName),
        data:{
            data:doc
        }
    });
});


exports.getOne = (Model, options) => catchAsync(async (req,res,next)=>{
    let query = Model.findById(req.params.id);
    if(options) query = query.populate(options);
    const doc = await query;

    if(!doc){
        return next(new AppError("No document found with that ID",404));
    }

    res.status(200).json({
        status:"success",
        data:{
            data:doc
        }
    });
});

exports.deleteOne = Model => catchAsync( async (req,res,next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc){
        return next(new AppError("No document found with this ID",404));
    }

    res.status(204).json({
        status:'success',
        message:"Deleted successfully",
        data:null,
    });
});

exports.updateOne = Model => catchAsync(async (req,res,next)=>{

    console.log(req.body);

    const doc = await Model.findByIdAndUpdate(req.params.id,req.body, {
        new:true,
        runValidators:true,
    });

    if(!doc){
        return next(new AppError("No document found with this ID",404));
    }

    res.status(200).json({
        status:'success',
        message:updatedMessage(doc.constructor.modelName),
        data:{
            data:doc
        }
    });
});

exports.getAll = Model => catchAsync(async (req,res,next) => {
    // To allow for nested GET comments on Event (hack)
    let filter = {};
    if(req.params.eventId) filter = {event : req.params.eventId};

    const features = await new APIFeatures(Model.find(filter),req.query)
                                                .filter()
                                                .sort()
                                                .limitFields()
                                                .paginate();

    const doc = await features.query;

    res.status(200).json({
        status:'success',
        results:doc.length,
        data:{
            data:doc
        }
    })

}) 