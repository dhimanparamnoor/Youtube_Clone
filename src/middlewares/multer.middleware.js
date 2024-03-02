import multer from "multer";


const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./public/temp") //tempary file storage ki location
    },
    filename: function(req,file,cb){
        cb(null, file.originalname) // jo bhi user apnai file ka naam rhkai ga wohi naam rhk do temparary baises kai liye 
    }
})

export const upload = multer({
    storage,
})

