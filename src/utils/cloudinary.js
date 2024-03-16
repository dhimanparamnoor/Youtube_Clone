import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_KEY ,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});


const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        // upload the file
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteOnCloudinary = async(url,resource_type) =>{
    const parts = url.split('/');

    const idWithExtension = parts[parts.length - 1];

    const id = idWithExtension.split('.')[0];

    try {
        if(!id) return null;
        const response = await cloudinary.api.delete_resources([id],{"resource_type": resource_type});
        return response;

    } catch (error) {
        return null;
    }
}

export { uploadOnCloudinary ,deleteOnCloudinary}