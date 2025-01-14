import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import rateLimit from "express-rate-limit"

dotenv.config()

const app = express()
// console.log(process.env.PORT)

const PORT = process.env.PORT

// Global rate limiting 

//loggin middleware
if(process.env.NODE_ENV === "development"){
app.use(morgan('dev'))

}

// Body Parser Middleware 
app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({extended:true, limit:'10kb'}));

// api routes 
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(err.status || 500)
    .json({
        status: "error",
        message:err.message || "Internale server error",
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    })
})



// it should alway be bottom
// 404 handler

app.use((req,res)=>{
    res.status(404).json({
        status:"error",
        message:"Route not found",
    })
})


app.listen(PORT, ()=>{
console.log(`your server run on http://localhost:${PORT} in ${process.env.NODE_ENV}`)
})