const mongoose = require('mongoose');
const validator = require('validator');
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
        type:Date,
        required:[true,"Event must have a start date"]
    },
    endDate:{
        type:Date,
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
        required:[true,'An event must have a duration'],
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

eventSchema.virtual('durationWeeks').get(function(){

    return this.duration/7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
eventSchema.pre('save',function(next){
    this.slug  = slugify(this.title,{lower : true});
    next();
})

const Event = mongoose.model('Event',eventSchema);
module.exports = Event;