const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.createOne = Model => catchAsync( async (req,res,next)=>{
    // console.log('****** ',req.body);
    const doc = await Model.create(req.body);
    res.status(201).json({
        status:"success",
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

exports.updateOne = Model => catchAsync(async (req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body, {
        new:true,
        runValidators:true,
    });

    if(!doc){
        return next(new AppError("No document found with this ID",404));
    }

    res.status(200).json({
        status:'success',
        data:{
            data:doc
        }
    });
});

exports.getAll = Model => catchAsync(async (req,res,next) => {
    let filter = {};

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