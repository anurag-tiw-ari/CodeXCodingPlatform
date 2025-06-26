import express from "express";
import { register,login,logout,adminRegister,deleteProfile,getProfile,heatMap,startFollow, startUnFollow, allFollowers, allFollowing, isFollowing,removeFollower, streak, streakAnotherUser, codingScore, battleinfo, getProfilePic, newPassword } from "../controllers/userAuthentication.js";
import userMidddleware from "../middleware/userMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { generateProfileUploadSignature,editProfile } from "../controllers/userEdit.js";
import { otpGenerate, otpGenerateForgetPass, verifyOTP, verifyOTPFP } from "../controllers/verificationOTP.js";


const authRouter=express.Router();

//generateOTP

authRouter.post("/generateotp",otpGenerate)

authRouter.post("/generateotp/forgotpassword",otpGenerateForgetPass)

//  Register

authRouter.post('/register',verifyOTP,register)

// Register Admin

authRouter.post('/admin/register',adminMiddleware,adminRegister)

//Login

authRouter.post('/login',login)


//LogOut

authRouter.post('/logout',userMidddleware,logout)

//GetProfile

//authRouter.get('/getProfile',getProfile)

//DeleteProfile

authRouter.delete('/deleteprofile',userMidddleware,deleteProfile)


authRouter.get('/check',userMidddleware,(req,res)=>{
    const reply = {
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id,
        role:req.result.role
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    })
})

//GetProfile

authRouter.get('/getProfile/:id',userMidddleware,getProfile)

//HeatMap

authRouter.post('/heatMap/:id',userMidddleware,heatMap)

//start follow

authRouter.post('/startfollow/:id',userMidddleware,startFollow)

authRouter.post('/startunfollow/:id',userMidddleware,startUnFollow)

authRouter.get('/allfollowers',userMidddleware,allFollowers)

authRouter.get('/allfollowing',userMidddleware,allFollowing)

authRouter.get('/isfollowing/:id',userMidddleware,isFollowing)

authRouter.get('/removefollower/:id',userMidddleware,removeFollower)

authRouter.get('/streak',userMidddleware,streak)

authRouter.get('/streak/anotheruser/:id',userMidddleware,streakAnotherUser)

// authRouter.get('/streak/anotheruser/:id',userMidddleware,streakAnotherUser)

// authRouter.get('/streak/anotheruser/:id',userMidddleware,streakAnotherUser)

authRouter.get('/codingscore',userMidddleware,codingScore)

authRouter.get('/battleinfo',userMidddleware,battleinfo)

authRouter.get('/profilepictureupload',userMidddleware,generateProfileUploadSignature)

authRouter.get('/profilepic',userMidddleware,getProfilePic)

authRouter.put('/editprofile',userMidddleware,editProfile)

authRouter.post('/forgotpass/newpass',newPassword)

authRouter.post('/forgotpass/verifyOTP',verifyOTPFP)

export default authRouter