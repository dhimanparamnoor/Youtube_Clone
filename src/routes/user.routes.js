import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js"


const router = Router()


router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]),registerUser)

export default router // default mai jab bhi export karaigai toh hum apna mancha naam rhk sktai hai jaise ki hum app.js mai userRoute lekha hua hai