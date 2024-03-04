import dotenv from "dotenv"
import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
import {app} from './app.js'
import express from "express";
// const app = express();

dotenv.config({
    path: './env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!! ",err);
})



// import express from "express";
// const app = express();

// ( async () => {
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error",(error)=>{
//         console.log("Err ",error);
//         throw error
//        })

//        app.listen(process.env.port, ()=>{
//         console.log(`App is listenting on port ${process.env.PORT}`);
//        })

//     } catch (error) {
//         console.log("Error ",error);
//         throw error;
//     }
// })()