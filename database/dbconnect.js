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
   try {
     if(!process.env.MONGO_URL){
         throw new Error("Mongo db URI is not  defined in env variables")
     }
     const  connectionOptions = {
         useNewUrlParser:true,
         useUnifiedTopology:true,
         maxPoolSize :10,
         serverSelectionTimeoutMS : 5000,
         socketTimeoutMS: 45000,
         family: 4 // use Ipv4
     };
 
     if(process.env.NODE_ENV === 'development'){
       mongoose.set('debug',true)
     }
 
     await mongoose.connect(process.env.MONGO_URL, connectionOptions);
 
     this.retryCount = 0 //reset retry count on success
   } catch (error) {
    console.error(error.message)
    await this.handleConnectionError();
   }

    
  }

  async handleConnectionError(){
    if(this.retryCount < MAX_RETRIES){
      this.retryCount++;
      console.log(`Retrying connection.... Attemp ${this.retryCount} of ${MAX_RETRIES}`);
      await new Promise(resolve =>setTimeout(() => {
        resolve()
      }, RETRY_INTERVAL))
      return this.connect()
    }else{
      console.error(`Failed to connect to MONGODB after ${MAX_RETRIES}`)
      process.exit(1)
    }
  }

  async handleDisconnection(){
    if(!this.isConnected){
      console.log("Attempting to reconnected to mongodb...")
      this.connect(  )
    }
  }
}
