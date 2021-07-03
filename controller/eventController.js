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

// this will only give access to Admin and Current user of Event
exports.restrictEvent = role =>{
    return async(req,res,next)=> {
         const event = await Event.findById(req.params.id);
         let users =[];
        if(event.createdBy == req.user.id){
            users.push(req.user.id);
        }
        users.push(role);

        if(users.includes(req.user.id)||users.includes("admin")){
            return next();
        }
        return next(new AppError("You don not have permission for this Event",403));
    }
}

// exports.restrictEvent = (req,res,next) => {

// }

exports.createEvent = factory.createOne(Event);
exports.getEvent = factory.getOne(Event, { path: 'comments participations, likes'});
exports.getEvents = factory.getAll(Event);
exports.updateEvent = factory.updateOne(Event);
exports.deleteEvent = factory.deleteOne(Event);


