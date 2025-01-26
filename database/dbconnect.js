import mongoose from "mongoose";

const MAX_RETRIES  = 3;

const RETRY_INTERVAL = 5000 // 5 SECONDS

class DatabaseConnection {

  constructor(){
    this.retryCount = 0;
    this.isConnected = false;

    //configure mongoose settings
    mongoose.set('strictQuery',true)  // it use to query field which is not exit in schema as model

    mongoose.connection.on('connected',()=>{
        console.log("MONGODB CONNECTED SUCCESSFULLY");
        this.isConnected = true;
    })

    mongoose.connection.on('error',()=>{
        console.log("MONGODB CONNECTION ERROR");
        this.isConnected = false;

    })
    mongoose.connection.on('disconnected',()=>{
        console.log("MONGODB DISCONNECTED");
        this.isConnected = false;
        //Todo attempt a reconnection

    })
  }

  async  connect() {
    if(!process.env.MONGO_URL){
        throw new Error("Mongo db URI is not  defined in env variables")
    }
    const  connectionOptions = {
        useNewUrlparser:true,
        useUnifiedTopology:true,
        maxPoolSize :10,
    }
  }
}
