import User from "../models/user.js"
import validate from "../utils/validator.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import redisClient from "../config/redis.js"
import Submission from "../models/submission.js"


const register=async (req,res)=>{

    try
    {

        //Validate the Data
        validate(req.body)
        
        const {firstName,emailId,password} =req.body

        const userExist = await User.find({emailId})

        if(userExist.length!=0)
        {
            throw new Error("User already Exist With this Email Id")
        }

        req.body.password = await bcrypt.hash(password,10)

        req.body.role="user";

        const user=await User.create({firstName,emailId,password:req.body.password,role:req.body.role})

        const token = jwt.sign({_id:user._id,emailId:emailId,role:'user'},process.env.KEY,{expiresIn:60*60})

        const reply = {
        firstName:user.firstName,
        emailId:user.emailId,
        _id:user._id,
        role:user.role,
       }

        res.cookie('token',token,{maxAge:60*60*1000})    //frontend

        res.status(201).json({
            user:reply,
            message:"LogedIn Successfully"
        })
         

    }
    catch(err){
        res.status(400).send("Error:"+err.message)
    }
}

const login=async(req,res)=>{
    try{
        const {emailId,password}=req.body

        console.log("emailId",emailId)

        if(!emailId)
        {
            throw new Error("Invalid Credentials")
        }
        if(!password)
        {
            throw new Error("Invalid Credentials")
        }
        
       const user = await User.findOne({emailId})

       console.log("user:", user)

       if(!user)
        throw new Error("User Not Found")

       const ans = await bcrypt.compare(password,user.password)

       if(!ans)
        throw new Error("Invalid Credentials")

       const reply = {
        firstName:user.firstName,
        emailId:user.emailId,
        _id:user._id,
        role:user.role,
       }

       const token = jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.KEY,{expiresIn:60*60})

        res.cookie('token',token,{maxAge:60*60*1000})   

        res.status(201).json({
            user:reply,
            message:"LogedIn Successfully"
        })
    }
    catch(err){
        res.status(401).send("Error:"+err)
    }
}

const logout = async(req,res)=>{

    try{

           const {token} = req.cookies;
 
           const payload = jwt.decode(token);

           await redisClient.set(`token:${token}`,"Blocked")

           await redisClient.expireAt(`token:${token}`,payload.exp)

           res.cookie("token",null,{expires: new Date(Date.now())})

           res.send("Logged Out SuccessFully")


    }
    catch(err){
        res.send("Error:"+err.message)
    }
}

const adminRegister= async (req,res)=>{
    try
    {

        //Validate the Data
        validate(req.body)
        
        const {firstName,emailId,password} =req.body

        req.body.password = await bcrypt.hash(password,10)

        const user=await User.create(req.body)

        const token = jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.KEY,{expiresIn:60*60})

        res.cookie('token',token,{maxAge:60*60*1000})   

        res.status(201).send("User Registrerd Sucessfully")
         

    }
    catch(err){
        res.status(400).send("Error:"+err)
    }
}

const deleteProfile = async (req,res)=>{
   try{
        const userId = req.result._id;

        if(!userId)
        {
            throw new Error("User Does Not Exist")
        }

        await  User.findByIdAndDelete(userId);

        await Submission.deleteMany({userId});

        res.status(200).send("Deleted Successfully");




   }
   catch(err)
   {
        res.status(400).send("Error:"+err);

   }
}

const getProfile = async (req,res) =>{
  
     try{
              const user= await User.findById(req.params.id).populate({
                 path:"problemSolved",
                 select:"_id title difficulty tags"
              });
     
              if(!user)
              {
                 throw new Error("user does not exist")
              }
     
              //console.log(user.problemSolved
     
              res.status(201).send(user)
              
             }
             catch(err)
             {
                 res.status(400).send("Error:"+err)
             }

}

const heatMap = async (req,res) => {

    try {
    const { year } = req.body;
    const userId = req.params.id; 

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    
    const submissions = await Submission.find({
    userId: userId,
    status:'accepted',
    createdAt: { $gte: startDate, $lte: endDate }
    }).select('createdAt');

    const countMap = {};

    submissions.forEach(sub => {
    const date = sub.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    countMap[date] = (countMap[date] || 0) + 1;
    });

    const heatmapData = Object.entries(countMap).map((curr) => ({
    date: curr[0],
    count: curr[1]
    }));

    res.json(heatmapData);
        }

    catch (err) 
    {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }

}  

const startFollow = async (req, res) => {
    try {
        const userId = req.result._id;
        const anotherUserId = req.params.id;

        if (!userId) 
            throw new Error("Invalid Credentials");
        if (!anotherUserId) 
            throw new Error("Id is missing");

        const anotherUser = await User.findById(anotherUserId);
        const user = await User.findById(userId);

        if (!anotherUser) 
            throw new Error("User Does Not Exist");
        if (!user) 
            throw new Error("LogIn or SignUp");

        if (anotherUser.followers.includes(userId)) 
        {
            return res.status(400).send("Already following this user");
        }

        anotherUser.followers.push(userId);
        user.following.push(anotherUserId);

        await anotherUser.save();
        await user.save();

        res.status(200).send("Followed");
    } 
    catch (err) 
    {
        res.status(400).send("Error: " + err.message);
    }
};

const startUnFollow = async (req, res) => {
    try {
        const userId = req.result._id;
        const anotherUserId = req.params.id;

        if (!userId) 
            throw new Error("Invalid Credentials");
        if (!anotherUserId) 
            throw new Error("Id is missing");

        const anotherUser = await User.findById(anotherUserId);
        const user = await User.findById(userId);

        if (!anotherUser) 
            throw new Error("User Does Not Exist");
        if (!user) 
            throw new Error("LogIn or SignUp");

        const followerIndex = anotherUser.followers.indexOf(userId);
        if (followerIndex !== -1) 
        {
            anotherUser.followers.splice(followerIndex, 1);
        }

        const followingIndex = user.following.indexOf(anotherUserId);
        if (followingIndex !== -1) 
        {
            user.following.splice(followingIndex, 1);
        }

        await anotherUser.save();
        await user.save();

        res.status(200).send("UnFollowed");
    } 
    catch (err) 
    {
        res.status(400).send("Error: " + err.message);
    }
};

const allFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.result._id).populate("followers", "_id firstName email");
        res.status(200).json(user.followers);
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
};

const allFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.result._id).populate("following", "_id firstName email");
        res.status(200).json(user.following);
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
};

const isFollowing = async (req, res) => {
    try {
        const currentUserId = req.result._id;
        const targetUserId = req.params.id;

        if (!currentUserId || !targetUserId) {
            throw new Error("Missing user ID(s)");
        }

        const user = await User.findById(currentUserId);

        const isFollowing = user.following.includes(targetUserId);

        res.status(200).send( isFollowing );
    } catch (err) {
        res.status(400).send(err.message );
    }
};

const removeFollower = async (req, res) => {
    try {
        const userId = req.result._id; 
        const followerId = req.params.id; 

        if (!userId || !followerId) {
            throw new Error("Missing user ID");
        }

        const user = await User.findById(userId);
        const follower = await User.findById(followerId);

        if (!user || !follower) 
            {
            throw new Error("User not found");
        }

        
        const followerIndex = user.followers.indexOf(followerId);
        if (followerIndex !== -1) 
        {
            user.followers.splice(followerIndex, 1);
        }

        
        const followingIndex = follower.following.indexOf(userId);
        if (followingIndex !== -1) 
        {
            follower.following.splice(followingIndex, 1);
        }

        await user.save();
        await follower.save();

        res.status(200).send("Follower removed successfully");
    } 
    catch(err) 
    {
        res.status(400).send("Error:"+ err.message);
    }
};

const streak = async (req, res) => {
  try {
    const userId = req.result._id;

    const user = await User.findById(userId);

    if (!user) 
    {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let lastDate = user.streak?.lastActive
      ? new Date(user.streak.lastActive.getFullYear(), user.streak.lastActive.getMonth(), user.streak.lastActive.getDate())
      : null;

    // Calculate difference in days
    if (lastDate) {
      const diffInDays = (todayDate - lastDate) / (1000 * 60 * 60 * 24);

      if (diffInDays > 1) {
        // streak broken
        user.streak.current = 0;
        await user.save();
      }
    }

    return res.status(200).json({
      currStreak: user.streak.current,
      maxStreak: user.streak.max,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const streakAnotherUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) 
    {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let lastDate = user.streak?.lastActive
      ? new Date(user.streak.lastActive.getFullYear(), user.streak.lastActive.getMonth(), user.streak.lastActive.getDate())
      : null;

    // Calculate difference in days
    if (lastDate) {
      const diffInDays = (todayDate - lastDate) / (1000 * 60 * 60 * 24);

      if (diffInDays > 1) {
        // streak broken
        user.streak.current = 0;
        await user.save();
      }
    }

    return res.status(200).json({
      currStreak: user.streak.current,
      maxStreak: user.streak.max,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const codingScore = async (req,res) => {
     try 
     {
        const user = await User.findById(req.result._id)
        res.status(200).send(user.codingScore);
    } 
    catch (err) 
    {
        res.status(400).send("Error: " + err.message);
    }
}

const battleinfo = async (req,res) => {
     try 
     {
        const user = await User.findById(req.result._id).select("coins battlesPlayed battlesWon")
        res.status(200).send(user);
    } 
    catch (err) 
    {
        res.status(400).send("Error: " + err.message);
    }
}

const getProfilePic = async (req,res) => {
 
    try 
     {
      //  console.log("Hiiii")
        const user = await User.findById(req.result._id).select("profilePic emailId age lastName")
        res.status(200).send(user);
    } 
    catch (err) 
    {
        res.status(400).send("Error: " + err.message);
    }    

}

const newPassword = async (req,res) => {

    const {newPassword,confirmPassword,emailId} = req.body;


    try{

    if(!newPassword || !confirmPassword || !emailId)
    {
        return res.status(400).send("Some Fields are missing")
    }

    const user = await User.findOne({emailId})

    if(!user)
    {
        return res.status(400).send("User Does Not Exist")
    }

    if(newPassword!==confirmPassword)
    {
        return res.status(400).send("Passowrd Does Not Match")
    }

    const password = await bcrypt.hash(newPassword,10)

    await User.findByIdAndUpdate(user._id,{password})

    res.status(200).send("Password Updated Successfully")
}
catch(err)
{
    res.status(500).send(err.message || "Internal Server Error")
}

}


export {register,login,logout,adminRegister,deleteProfile,getProfile,heatMap,startFollow,startUnFollow,allFollowers,allFollowing,isFollowing,removeFollower,streak,streakAnotherUser,codingScore,battleinfo,getProfilePic,newPassword}