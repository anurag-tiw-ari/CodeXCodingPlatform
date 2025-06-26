import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../authSlice';
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import GridBackground from '../Components/GridBackground';
import axiosClient from '../utils/axiosClient';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string()
    .min(8, "Password must have at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
});

function SignUpPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [formData, setFormData] = useState(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  console.log("isAuthenticated:", isAuthenticated)
  console.log("showOTPmodel:", showOTPModal)


  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const handleGetVerificationCode = async (data) => {
    setIsSendingOTP(true);
    try {
      await axiosClient.post('/user/generateotp', { emailId: data.emailId });
      setFormData(data);
      setShowOTPModal(true);
      setOtpCountdown(300); // 5 minutes
      toast.success("OTP sent to your email!");
    } catch (err) {
      toast.error(err.response?.data || "Failed to send OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    try {
      await axiosClient.post('/user/generateotp', { emailId: formData.emailId });
      setOtpCountdown(300); // Reset to 5 minutes
      toast.success("New OTP sent to your email!");
    } catch (err) {
      toast.error(err.response?.data || "Failed to resend OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyAndSubmit = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
     // console.log("HelloUser1")
      await dispatch(registerUser({ ...formData, otp })).unwrap();
    //  console.log("hellouser2")
    //    setShowOTPModal(false);
    } catch (err) {
      toast.error(err?.response?.data || "OTP verification failed");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <GridBackground />
      
      {/* Main Signup Form */}
      <div className="card w-96 bg-base-100 shadow-xl hover:shadow-indigo-600/40 z-10"> 
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold text-indigo-500 hover:text-indigo-700">
            CODING PLATFORM
          </h2>
          <form onSubmit={handleSubmit(handleGetVerificationCode)}>
            {/* Form fields remain the same */}
            <div className="form-control">
              <label className="label mb-1">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                placeholder="John"
                className={`input input-bordered ${errors.firstName && 'input-error'}`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <span className="text-error">{errors.firstName.message}</span>
              )}
            </div>

            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text">Email</span>
              </label>
              <input
                type="text"
                placeholder="john@example.com"
                className={`input input-bordered ${errors.emailId && 'input-error'}`}
                {...register('emailId')}
              />
              {errors.emailId && (
                <span className="text-error">{errors.emailId.message}</span>
              )}
            </div>

            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`input input-bordered ${errors.password && 'input-error'}`}
                {...register('password')}
              />
              {errors.password && (
                <span className="text-error">{errors.password.message}</span>
              )}
            </div>

            <div className="form-control mt-6 flex justify-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSendingOTP}
              >
                {isSendingOTP ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Sending OTP...
                  </>
                ) : "Get Verification Code"}
              </button>
            </div>
          </form>
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-sm text-indigo-500 hover:underline">Log in</Link>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-base-100 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Verify Your Email</h3>
              <button 
                onClick={() => setShowOTPModal(false)}
                className="btn btn-sm btn-circle"
              >
                ✕
              </button>
            </div>
            
            <p className="mb-4">
              We've sent a 6-digit code to <span className="font-semibold">{formData?.emailId}</span>
            </p>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Enter Verification Code</span>
              </label>
              <input
                type="text"
                placeholder="123456"
                className="input input-bordered w-full"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div>
                {otpCountdown > 0 ? (
                  <span className="text-sm">
                    Code expires in: <span className="font-mono">{formatTime(otpCountdown)}</span>
                  </span>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={isSendingOTP}
                    className="text-sm text-indigo-500 hover:underline"
                  >
                    {isSendingOTP ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>
              
              <button
                onClick={handleVerifyAndSubmit}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Verifying...
                  </>
                ) : "Verify & Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignUpPage;






// const [name,setName]=useState('')
//     const [email,setEmail]=useState('')
//     const [password,setPassword]=useState('')

//     const handleSubmit = (e)=>
//     {
//           e.preventDefault();

//           console.log(name,email,password)
//     }

//     return(
//         <>
//         <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center h-screen gap-y-2">
//               <input type="text" name="firstName" value={name} placeholder="Enter Your Name" onChange={(e)=>{setName(e.target.value)}}/>
//               <input type="email" name="email" value={email} placeholder="Enter Your Email" onChange={(e)=>{setEmail(e.target.value)}}/>
//               <input type="password" name="password" value={password} placeholder="Enter Your Password" onChange={(e)=>{setPassword(e.target.value)}}/>
            
//               <button type="submit">Submit</button>
//         </form>
//         </>
//      )