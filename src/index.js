import dotenv from 'dotenv';
import connectDb from "./db/index.js";
import { app } from './app.js';
dotenv.config({
    path:'./env'
})
connectDb()
.then(()=>{
    app.listen(process.env.PORT || 5000 ,()=>{
        console.log(`Server Started ${process.env.PORT || 5000}`);
    })
})
.catch((e)=>{
    console.log("DB connection failed !!!" ,e);
})






