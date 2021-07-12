const mongoose = require('mongoose');
const slugify = require('slugify');

const eventSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title is required"],
        unique:true,

    },
    slug:String,
    description:{
        type:String,
        required:[true,"Description is required"]
    },
    address:{
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number,
    },
    coverImage:{
        type:String,
        required:[true,"Event must have a cover image"]
    },
    featureImages:[String],
    price:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false,
    },
    createdBy:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,"Created by is required"]
    },
    startDate:{
        type:String,
        required:[true,"Event must have a start date"]
    },
    endDate:{
        type:String,
        required:[true,"Event must have a end date"],
        validate:{
            validator:function(el){
                return el>this.startDate;
            },
            message:"End date isn't after start date",
        }
    },
    duration:{
        type:Number,
        // required:[true,'An event must have a duration'],
    },
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});


// eventSchema.virtual('durationWeeks').get(function(){

//     return this.duration/7;
// });
// this virtual adds all review of specific event 
// VIRTUAL POPULATE
eventSchema.virtual('comments',{
    ref: 'Comment',
    foreignField: 'event',
    localField: '_id'
});

// virtual populate for participation
eventSchema.virtual('participations', {
    ref:'Participation',
    foreignField: 'event',
    localField: '_id'
});

// virtual pulupate for likes
eventSchema.virtual('likes', {
    ref:"Like",
    foreignField: 'event',
    localField: '_id'
});


// DOCUMENT MIDDLEWARE: runs before .save() and .create()
eventSchema.pre('save',function(next){
    this.slug  = slugify(this.title,{lower : true});
    next();
})

const Event = mongoose.model('Event',eventSchema);
module.exports = Event;