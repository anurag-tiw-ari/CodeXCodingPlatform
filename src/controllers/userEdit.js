import { v2 as cloudinary } from 'cloudinary';
import User from '../models/user.js';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateProfileUploadSignature = async (req, res) => {
  try {
    const userId = req.result._id; 

    // Generate unique public_id for the image
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `user-profilepicture/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).send('Failed to generate upload credentials');
  }
};

const editProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      age,
      profilePic
    } = req.body;

    const userId = req.result._id; 

    console.log("userId:", userId)
   // console.log("emailId:", emailId)
    console.log("age:", age)

    // if (emailId) {
    //   const foundUser = await User.findOne({ emailId });
    //   console.log("founduserId:", foundUser?._id)
    //   if (foundUser && foundUser._id.toString() !== userId.toString()) {
    //     return res.status(400).send("User with this Email Id already exists");
    //   }
    // }

    console.log("profilePic:", profilePic)

    if (profilePic && profilePic.cloudinaryPublicId) 
    {
      // Verify the upload with Cloudinary
      const cloudinaryResource = await cloudinary.api.resource(
        profilePic.cloudinaryPublicId,
        { resource_type: 'image' }
      );

      if (!cloudinaryResource) {
        return res.status(400).json({ error: 'Image not found on Cloudinary' });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName:lastName?.length < 3 ? null : lastName,
        age,
        profilePic
      },
      {runValidators:true,new:true}
    ).select('-password'); // Exclude password from the response

    console.log("updatedUser:", updatedUser)

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export { generateProfileUploadSignature, editProfile };