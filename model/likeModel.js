const mongoose = require('mongoose');


const likeSchema = new mongoose.Schema({
    event:{
        type:mongoose.Schema.ObjectId,
        ref:'Event',
        unique:true,
        required:[true,'Like most belongs to an event']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        // unique:true,
        required:[true,'Like most belongs to an user'],
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
},{
    toJSON: { virtuals: true },
    toObject: {virtuals: true }
});

likeSchema.pre(/^find/, function(next)  {
    this.populate({
        path: 'user',
        select: 'name'
    });

    next();
});


const Like = new mongoose.model('Like',likeSchema);
module.exports = Like;