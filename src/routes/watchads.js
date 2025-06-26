
import express from "express"
import userMidddleware from "../middleware/userMiddleware.js";
import User from "../models/user.js";

const watchadsRouter = express.Router();

watchadsRouter.put("/ads",userMidddleware,async (req,res)=>{

    try {
    const  userId  = req.result._id;

    
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send( "User not found" );
    }

    user.coins = (user.coins || 0) + 500;

    await user.save();

    res.status(201).send("Coins Updated");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(error.message||"Internal Server Error" );
  }

})


export default watchadsRouter