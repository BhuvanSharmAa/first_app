import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    
    fullName:{
        type:String,
        required:true,
        trim:true
    },
    avatar:{
        type:String,
        required:true,
        
    },
    coverImage:{
        type:String,
        
        
    },
    watchHistory:[{
        type: Schema.Types.ObjectId,
        ref : "Video"
    }],
    password:{
        type:String,
        required:[true, "Password is required"]
    },
    refreshToken:{
        type:String,
        default:null
    },

    
    


},{timestamps:true});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
userSchema.methods.isPasswordMatch = async function(password) {
    
    return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function() {
    try {
        const token = jwt.sign(
            { 
                _id: this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName 
            },
            process.env.ACCESS_TOKEN_SECRET,
            { 
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN 
            }
        )
        console.log("Access token generated")
        return token
    } catch (error) {
        console.error("Error generating access token:", error)
        throw new Error("Error generating access token")
    }
}

userSchema.methods.generateRefreshToken = function() {
    try {
        const token = jwt.sign(
            { 
                _id: this._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN 
            }
        )
        console.log("Refresh token generated")
        return token
    } catch (error) {
        console.error("Error generating refresh token:", error)
        throw new Error("Error generating refresh token")
    }
}




export const User = mongoose.model('User', userSchema);