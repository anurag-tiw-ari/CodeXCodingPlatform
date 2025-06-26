import User from "../models/user.js"


const socketMiddleware = async (socket, next) => {
  try{
       const userId= socket.handshake.query.userId
       if(!userId)
       {
           return next(new Error("No userId"))
       }

       const user = await User.findById(userId)
       if(!user)
       {
           return next(new Error("User Does not exist!!"))
       }

       socket.user = user;
    //   console.log("user", user)
       next();
  }
  catch(err)
  {
      return next(new Error("Authentication Fail"))      
  }
}

export default socketMiddleware