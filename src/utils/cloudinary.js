import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
       
    });

const  uploadOnCloudinary = async (filePath) => {
    try{
        if(!filePath) throw new Error('File path is required');
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto',
            folder: 'auto'
        })
        console.log(result);
        console.log('File uploaded successfully');
        return result;
    }
    catch(error)
    {
        fs.unlinkSync(filePath);
        return null;
    }
}

export default uploadOnCloudinary;