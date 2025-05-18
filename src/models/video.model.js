import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile:{
            type:String,
            required:true,
            trim:true,
            unique:true
        },
        thumbnail:{
            type:String,
            required:true,
            trim:true
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:false
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        }


},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate);



export const Video = mongoose.model('Video', videoSchema);