const multer = require('multer');
const sharp = require('sharp');
const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./../controller/handleFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }else{
        cb(new AppError("Not an image! Please upload only image",400),false);
    }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter,
});

exports.uploadUserImages = upload.fields([
    {name:"profilePhoto",maxCount:1}
]); 

exports.resizeUserImages = catchAsync(async(req,res,next)=>{
    console.log(req.body.id);
    if(req.body !== null){
        if(!req.files.profilePhoto) return next();

        req.body.profilePhoto = `user-${req.body.id}-${Date.now()}-profile-image.jpeg`;
        await sharp(req.files.profilePhoto[0].buffer)
            .resize(2000,1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90})
            .toFile(`public/img/users/${req.body.profilePhoto}`);
    }

    next();
})


const filterObj = (obj, ...allowFields)=>{
    const newObj ={};
    Object.keys(obj).forEach(el=>{
        if(allowFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
}

exports.getMe = (req,res,next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req,res,next)=>{
    // 1. Create error, if user POSTed password data
        if(req.body.password || req.body.confirmPassword){
            return next(new AppError("This route is not for password updates. Please use /updateMyPassword.",400));
        }

    // 2. Filtered out unwanted fields names that are not allowed to be updated
        const filteredBody = filterObj(req.body,"name","email","profilePhoto","userType","role");

    // 3. Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{new:true,runValidators:true});

    res.status(200).json({
        status:"success",
        message:"User Updated successfully",
        data:{
            updatedUser
        }
    })
});

exports.deleteMe = catchAsync(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id, {active:false});

    res.status(204).json({
        status:'success',
        message:"User deleted successfully",
        data:null
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not defined! Please use /signup instead'
    });
  };

exports.getUser = factory.getOne(User,{path: 'events'});
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

