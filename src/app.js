import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"})) // to apply limit to json that is comming to backend
// that it accept json data

app.use(express.urlencoded({extended: true, limit:"16kb"}))

app.use(express.static("public")) // to store data temporary to the server

app.use(cookieParser()) // to get and store cookies to user data basically perform crud performance


// routes import
import userRouter from './routes/user.routes.js'


// routes declartion
app.use("/api/v1/users",userRouter)

export { app }