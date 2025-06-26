import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

//console.log("password:", process.env.EMAIL_PASS)
//console.log("USER:", process.env.EMAIL_USER)

const sendOTPEmail = async (email, otp) => {

    //console.log("Hellox1")
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; max-height:60vh;">
          <h2 style="color: #3498db;">Email Verification</h2>
          <p>Your OTP for email verification is:</p>
          <h1 style="background: #f1f1f1; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h1>
          <p style="color:red">This OTP is valid for 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } 
  
  catch (error) {

   // console.log("Hellox2")
    console.error('Error sending email:', error);
    return false;
  }
};

export default sendOTPEmail