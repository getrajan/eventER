const multer = require('multer');
const sharp = require('sharp');
const Event = require('./../model/eventModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./../controller/handleFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
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

// exports.uploadEventImages = upload.single('coverImage');

exports.uploadEventImages = upload.fields([
    { name: 'coverImage',maxCount:1 },
    { name:'featureImages',maxCount:2},
]);

exports.resizeEventImages = catchAsync(async (req,res,next)=>{
    if(!req.files.coverImage && !req.files.featureImages) return next();

    if(req.files.coverImage){
        // 1) Cover Image
        req.body.coverImage = `event-${req.params.id}-${Date.now()}-cover.jpeg`;
        await sharp(req.files.coverImage[0].buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90})
        .toFile(`public/img/events/${req.body.coverImage}`);
    }

    if(req.files.featureImages){
        // 2. Feature Images
        req.body.featureImages = [];
        await Promise.all(
            req.files.featureImages.map(async (file , i)=>{
                const filename = `event-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
                await sharp(file.buffer)
                .resize(2000,1333)
                .toFormat('jpeg')
                .jpeg( { quality:90 } )
                .toFile(`public/img/events/${filename}`);
                
                req.body.featureImages.push(filename);
            })
        )
    }
    next();

});

exports.aliasTopEvents = (req,res,next) => {
    req.query.limit = '2';
    req.query.sort = "-duration";
    req.query.fields = "title,description,address";
    next();
}

exports.createEvent = factory.createOne(Event);
exports.getEvents = factory.getAll(Event);
exports.updateEvent = factory.updateOne(Event);


