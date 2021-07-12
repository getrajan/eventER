const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Participation belongs to an user'],
    },
    event:{
        type:mongoose.Schema.ObjectId,
        ref:'Event',
        unique:true,
        required: [true, "Participation belongs to an event" ],
    },
    createdAt:{
        type:Date,
        default: Date.now()
    },
    participationStatus:{
        type:String,
        enum: [ "interested", "going" ],
        required: [true , "Participation status is required" ]
    },
    attend:{
        type:Boolean,
        default: false,
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals:true }
});

participationSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name profilePhoto'
    }).populate({
        path:'event',
        select: '_id title coverImage'
    })
    next(); 
});

const Participation = mongoose.model('Participation', participationSchema);
module.exports = Participation;