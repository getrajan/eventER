const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment:{
        type:String,
        required:[true,'Comment can not be empty'],
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    event:{
        type:mongoose.Schema.ObjectId,
        ref:'Event',
        required:[true,'Comment most belong to event']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,"Comment most belong to an user"]
    }

},{
    toJSON:{ virtuals:true },
    toObject: { virtuals:true }
});

commentSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:'event',
    //     select:'title'
    // }).populate({
    //     path:'user',
    //     select:'name profilePhoto'
    // });

    this.populate({
        path: 'user',
        select: 'name profilePhoto'
    });
    next();
})

const Comment = mongoose.model('Comment',commentSchema);
module.exports = Comment;


