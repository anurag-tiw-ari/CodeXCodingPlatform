import User from "../models/user.js";
import otpGenerator from "otp-generator";
import redisClient from "../config/redis.js";
import sendOTPEmail from "../utils/emailService.js";

const otpGenerate = async (req,res) =>{

    try{
    
    const {emailId} = req.body;

    if(!emailId)
    {
        return res.status(400).send("Credentials Missing");
    }

    const user = await User.findOne({emailId})

    console.log("user:", user)

    if(user)
    {
        return res.status(400).send("User Already Exist with this emailId");
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

  //  console.log("otp:", otp)

    await redisClient.set(`otp-${emailId}`,otp)

//    console.log("Hello1")

    await redisClient.expire(`otp-${emailId}`, 5*60);

   // console.log("Hello2")

    const emailSent = await sendOTPEmail(emailId,otp)

  //  console.log("Emailsent:", emailSent)

     if (emailSent) 
    {
      return res.json({ 
        success: true, 
        message: 'OTP sent successfully',
        otp: process.env.NODE_ENV === 'development' ? otp : null
      })
    } 
    else 
    {
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }
}
catch(err)
{
    console.error('Error generating OTP:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
}

}

const verifyOTP = async (req, res, next) => {

//  console.log("H1")  
  const { emailId, otp } = req.body;

  if (!emailId || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  try {
    const storedOTP = await redisClient.get(`otp-${emailId}`);

    if (!storedOTP) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired' });
    }

    if (storedOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    
    await redisClient.del(`otp-${emailId}`);

    next();
  } 
  
  catch (error) 
  {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const otpGenerateForgetPass = async (req,res) =>{

    try{
    
    const {emailId} = req.body;

    if(!emailId)
    {
        return res.status(400).send("Credentials Missing");
    }

    const user = await User.findOne({emailId})

    console.log("user:", user)

    if(!user)
    {
        return res.status(400).send("User Does Not Exist");
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

  //  console.log("otp:", otp)

    await redisClient.set(`otp-${emailId}`,otp)

//    console.log("Hello1")

    await redisClient.expire(`otp-${emailId}`, 5*60);

   // console.log("Hello2")

    const emailSent = await sendOTPEmail(emailId,otp)

  //  console.log("Emailsent:", emailSent)

     if (emailSent) 
    {
      return res.json({ 
        success: true, 
        message: 'OTP sent successfully',
        otp: process.env.NODE_ENV === 'development' ? otp : null
      })
    } 
    else 
    {
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }
}
catch(err)
{
    console.error('Error generating OTP:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
}

}

const verifyOTPFP = async (req, res) => {

//  console.log("H1")  
  const { emailId, otp } = req.body;

  if (!emailId || !otp) {
    return res.status(400).send( 'Email and OTP are required' );
  }

  try {
    const storedOTP = await redisClient.get(`otp-${emailId}`);

    if (!storedOTP) {
      return res.status(400).send('OTP not found or expired');
    }

    if (storedOTP !== otp) {
      return res.status(400).send('Invalid OTP');
    }

    
    await redisClient.del(`otp-${emailId}`);

    res.status(200).json({success:true,message:"OTP is correct"});
  } 
  
  catch (error) 
  {
    console.error('Error verifying OTP:', error);
    return res.status(500).json('Internal server error');
  }
};

export {otpGenerate,verifyOTP,otpGenerateForgetPass,verifyOTPFP}