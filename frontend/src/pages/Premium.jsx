import { useState,useEffect } from "react";
import axiosClient from "../utils/axiosClient";

function SubscriptionPlans() {
    const [isPremium,setIsPremium] = useState(false);

      useEffect(() => {
        const fetchProblem = async () => {
          try {
           
            const premRes = await axiosClient.get("/user/premium");
            setIsPremium(premRes.data.premium);
            
          } catch (err) {
            console.log(err.response?.data || err.message);
          }
        };
        
        fetchProblem();
      }, []);
  const paymentHandler = async () => {
    const amount = 99900
    const currency = "INR";
    const receiptId = `receipt_${Date.now()}`;

    try {
      const orderRes = await axiosClient.post("/payment/order", {
  amount,
  currency,
  receipt: receiptId,
});

console.log(orderRes);

const orderId = orderRes.data.id; 

var options = {
  key: "rzp_test_ERUOHLPBFxOfNr",
  amount,
  currency,
  name: "CodexCodingPlatform",
  description: `Premium Subscription`,
  image: "https://codex.com/logo.png",
  order_id: orderId, 
  handler: async function (response) {
    console.log("Razorpay Response:", response); 

    const body = {
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
    };

    const validateRes = await axiosClient.post(
      "/payment/order/validate",
      body
    );
    console.log(validateRes);
  },
  prefill: {
    name: "Codex",
    email: "user@example.com",
    contact: "9000000000",
  },
  theme: {
    color: "#3399cc",
  },
};


      var rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp1.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert(`Error processing payment. Please try again. ${error}`);
    }
  };

  return (
    <div className="h-screen bg-base-100 py-12 px-4 mt-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-base-content">Choose Your Plan</h1>
        <p className="text-xl text-center mb-12 text-base-content opacity-80">Upgrade your coding experience with our premium features</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Plan */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl font-bold text-base-content">Basic Plan</h2>
              <div className="text-4xl font-bold my-4 text-base-content">Free</div>
              <p className="text-base-content opacity-70 mb-6">Perfect for beginners starting their coding journey</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-base-content">Unlimited Submissions</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-base-content">Unlimited Battles</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-base-content">Comment Support</span>
                </div>
                 <div className="flex items-center">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-base-content">All Article Access</span>
                </div>
                <div className="flex items-center text-base-content opacity-50">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>No AI Assistance</span>
                </div>
                <div className="flex items-center text-base-content opacity-50">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>500 Battle Coins</span>
                </div>
                <div className="flex items-center text-base-content opacity-50">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Only Dark Theme</span>
                </div>
                <div className="flex items-center text-base-content opacity-50">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>No Refernce Solution & Editorials</span>
                </div>
              </div>
              
              <div className="card-actions justify-center">
                <button className="btn bg-primary/30 w-full " disabled={true}>
                  {isPremium?"Basic":"Current Plan"}
                </button>
              </div>
            </div>
          </div>
          
          {/* Premium Plan */}
          <div className="card bg-base-200 shadow-xl border-2 border-primary relative">
            <div className="absolute top-0 right-0 bg-primary text-primary-content px-4 py-1 rounded-bl-lg rounded-tr-lg font-bold">
              POPULAR
            </div>
            <div className="card-body">
              <h2 className="card-title text-2xl font-bold text-base-content">Premium Plan</h2>
              <div className="text-4xl font-bold my-4 text-base-content">₹999 LifeTime</div>
              <p className="text-base-content opacity-70 mb-6">Perfect for serious Coders</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-base-content">Unlimited Submissions</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-base-content">Unlimited Battles</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-base-content">Comment Support</span>
                </div>
                 <div className="flex items-center">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-base-content">All Article Access</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>AI Assistance</span>
                </div>
                <div className="flex items-center ">
                 <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>20000 Battle Coins Extra</span>
                </div>
                <div className="flex items-center ">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>20+ Themes</span>
                </div>
                <div className="flex items-center ">
                  <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Refernce Solution & Editorials</span>
                </div>
              </div>
              
              <div className="card-actions justify-center">
                <button className="btn bg-primary/30 w-full" disabled={isPremium} onClick={paymentHandler}>
                  {isPremium?"Current Plan":"Upgrade"}
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default SubscriptionPlans;