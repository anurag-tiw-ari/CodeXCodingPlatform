import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const editProfileSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  lastName: z.string().min(3, "Minimum character should be 3")
  .optional()
  .or(z.literal('')),
  age: z.string().min(1, "Age should be Greater Than 10 Years").max(10, "Age should be Less Than 80 Years")
  .optional()
  .or(z.literal('')),
//   emailId: z.string().email("Invalid Email"),
  profilePicture: z.instanceof(FileList).refine(
    (files) => files.length === 0 || files[0].size <= 5 * 1024 * 1024,
    "Image Must be less than 5MB"
  ).optional()
});

function EditProfile() {
  const { user } = useSelector((state) => state.auth);
  const [profilepic, setProfilePic] = useState(null);
  const [cloudinaryResult, setCloudinaryResult] = useState(null);
  const [progress, setUploadProgress] = useState(null);
  const [emailId,setEmailId] = useState("");
  const [age,setAge] = useState("")
  const [uploading,setUploading] = useState(false)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)

  useEffect(() => {
    const fetchPP = async () => {
      try {
        const resp = await axiosClient.get('/user/profilepic');
       // console.log("response", resp);
        setProfilePic(resp.data.profilePic.secureURL);
        setEmailId(resp.data.emailId)
        // setAge(resp.data.age)

        setValue("emailId", resp.data.emailId);
        setValue("age", resp.data.age);
        setValue("lastName", resp.data.lastName)

         reset({
        firstName: user?.firstName,
        lastName: user?.lastName,
        // emailId: resp.data.emailId,
        age: resp.data.age
      });
      } catch (err) {
        console.log(err?.response?.data);
      //  toast.error('Failed to load profile picture');
      }
    };
    fetchPP();
  }, [user]);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
    //   emailId: emailId,
      age: age
    }
  });

  const handleImageUpload = async (file) => {
    try {

      setUploading(true)
      const response = await axiosClient.get('/user/profilepictureupload');
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = response.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setCloudinaryResult(uploadResponse.data);
      setProfilePic(uploadResponse.data.secure_url);
      setUploadProgress(null);
      toast.success('Profile picture uploaded successfully!');
    } catch (err) {
      console.log(err?.response?.data);
      toast.error('Failed to upload profile picture');
    }
    finally{
        setUploadProgress(null);
      setUploading(false)
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        emailId: data.emailId,
        age: data.age,
      };

      if (cloudinaryResult) {
        payload.profilePic = {
          secureURL: cloudinaryResult.secure_url,
          cloudinaryPublicId: cloudinaryResult.public_id
        };
      }
       
      setLoading(true)
      await axiosClient.put('/user/editprofile', payload);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.log(err?.response?.data);
      setLoading(false)
      toast.error('Failed to update profile');
    }
  };

    if (!user) {
    return (
        <div className='h-screen flex justify-center items-center'>
            <div className="alert alert-error max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>First Log in or Register</span>
      </div>
        </div>
      
    );
  }


  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-200 rounded-box shadow-lg mt-17">
      <h1 className="text-3xl font-bold text-center mb-8">Edit Profile</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="avatar">
            <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img 
                src={profilepic || "https://th.bing.com/th/id/OIP.-OwdeGjbVmQWf62Ynk9_8AHaHa?r=0&w=720&h=720&rs=1&pid=ImgDetMain"} 
                alt="Profile" 
                className="object-cover"
              />
            </div>
          </div>
          
          <div className="w-full max-w-xs">
            <label className="label">
              <span className="label-text">Profile Picture</span>
            </label>
            <input
              type="file"
              accept="image/*"
              {...register("profilePicture")}
              className="file-input file-input-bordered file-input-primary w-full"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
            />
            {errors.profilePicture && (
              <span className="text-error text-sm">{errors.profilePicture.message}</span>
            )}
            {progress !== null && (
              <div className="mt-2">
                <progress 
                  className="progress progress-primary w-full" 
                  value={progress} 
                  max="100"
                ></progress>
                <span className="text-sm">Uploading: {progress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">First Name</span>
            </label>
            <input
              type="text"
              {...register("firstName")}
              className={`input input-bordered ${errors.firstName ? 'input-error' : ''}`}
            />
            {errors.firstName && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.firstName.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Last Name</span>
            </label>
            <input
              type="text"
              placeholder='Enter Your Last Name (Optional)'
              {...register("lastName")}
              className={`input input-bordered ${errors.lastName ? 'input-error' : ''}`}
            />
            {errors.lastName && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.lastName.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text ">Email</span>
            </label>
            <input
              type="email"
              value={emailId}
              className={`input input-bordered bg-gray-700 text-gray-500`}
              title="Email Can not Change"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Age</span>
            </label>
            <input
              type="text"
              placeholder='Enter Your Age (Optional)'
              {...register("age")}
              className={`input input-bordered ${errors.age ? 'input-error' : ''}`}
            />
            {errors.age ? (
              <label className="label">
                <span className="label-text-alt text-error">{errors.age.message}</span>
              </label>
            ) : ( 
                <div>
                    <span className='text-xs opacity-30'>Age Should be Greater than 10 years</span>
                </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button type="submit" className="btn btn-primary w-full max-w-xs" disabled={loading}>
           { loading ? "Saving Changes" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;