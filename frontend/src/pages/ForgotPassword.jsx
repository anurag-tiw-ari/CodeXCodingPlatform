import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';


const forgotPasswordSchema = z.object({
  emailId: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
  newPassword: z.string()
    .min(8, "Password must have at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .optional(),
  confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ["confirmPassword"]
    });
  }
});

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1 = email, 2 = OTP, 3 = password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      if (currentStep === 1) {
   
        const response = await axiosClient.post('/user/generateotp/forgotpassword', {
          emailId: data.emailId,
        });
        
        if (response.data.success) {
          setCurrentStep(2);
        } else {
          setError(response.data|| 'Failed to send OTP');
        }
      } 
      else if (currentStep === 2) {

        const response = await axiosClient.post('/user/forgotpass/verifyOTP', {
          emailId: data.emailId,
          otp: data.otp,
        });
        
        if (response.data.success) {
          setCurrentStep(3);
        } else {
          setError(response.data || 'Invalid OTP');
        }
      } 
      else if (currentStep === 3) {
      
        const response = await axiosClient.post('/user/forgotpass/newpass', {
          emailId: data.emailId,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        });
        
        if (response.status === 200) {
          alert('Password changed successfully!');
          setLoading(false);
          setCurrentStep(1)

        } else {
          setError(response.data || 'Failed to change password');
        }
      }
    } catch (err) {
      setError(err.response?.data || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Forgot Password</h2>
          
          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
           
            {currentStep === 1 && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input input-bordered"
                  {...register("emailId")}
                />
                {formState.errors.emailId && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {formState.errors.emailId.message}
                    </span>
                  </label>
                )}
              </div>
            )}

      
            {currentStep === 2 && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">OTP</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="input input-bordered"
                  {...register("otp")}
                />
                {formState.errors.otp && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {formState.errors.otp.message}
                    </span>
                  </label>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">New Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="input input-bordered"
                    {...register("newPassword")}
                  />
                  {formState.errors.newPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {formState.errors.newPassword.message}
                      </span>
                    </label>
                  )}
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="input input-bordered"
                    {...register("confirmPassword")}
                  />
                  {formState.errors.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {formState.errors.confirmPassword.message}
                      </span>
                    </label>
                  )}
                </div>
              </>
            )}
            
            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? 'Processing...' : 
                  currentStep === 1 ? 'Send OTP' :
                  currentStep === 2 ? 'Verify OTP' : 
                  'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;