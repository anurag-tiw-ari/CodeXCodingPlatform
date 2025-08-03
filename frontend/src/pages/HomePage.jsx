// src/pages/HomePage.jsx

import { Link } from "react-router";
import DataStructureCards from "../Components/DataStructureCards";
import { motion } from "framer-motion";
import HomePageMarquee from "../Components/HomePageMarquee";
import Footer from "../Components/Footer.jsx";
import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient.js";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import BattlePromoSection from "../Components/BattlePromoSection.jsx";
import { useLocation } from "react-router";

import BinaryRainBackground from "../Components/BinaryRainBackground.jsx";
import InteractiveArc from "../Components/InteractiveArc.jsx";


function HomePage() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageId = queryParams.get('pageId');

  useEffect(() => {
    const element = document.getElementById(pageId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [pageId]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosClient.get('/contentcomment/getNotification');
        setNotifications(response.data);
      } catch (err) {
        if (isAuthenticated)
          toast.error(err.response?.data || "Failed to fetch notifications");
      }
    };

    const checkPremiumStatus = async () => {
      try {
        if (isAuthenticated) {
          const premRes = await axiosClient.get("/user/premium");
          setIsPremium(premRes.data.premium);
        }
      } catch (err) {
        toast.error(err.response?.data || "Failed to check premium status");
      } finally {
        setLoadingPremium(false);
      }
    };

    fetchNotifications();
    checkPremiumStatus();
  }, [isAuthenticated]);

  const handleNotificationClick = async (notificationId, contentId, topic, title, commentId) => {
    try {
      await axiosClient.get(`/contentcomment/readnotification/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      window.location.href = `/content/${topic}/${contentId}?commentId=${commentId}`;
    } catch (err) {
      if (isAuthenticated)
        toast.error(err.response?.data || "Failed to mark notification as read");
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="min-h-screen bg-base-300 mt-6 overflow-x-hidden"> {/* Prevent horizontal scroll */}
      
      {isAuthenticated && !loadingPremium && (
        <div className="fixed top-20 right-4 z-50">
          {isPremium ? (
            <div className="badge gap-2 bg-amber-700 text-amber-100 border-amber-600 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Premium Member
            </div>
          ) : (
            <Link to="/upgrade" className="badge gap-2 bg-gray-900 text-gray-100 border-gray-700 shadow-lg hover:bg-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Upgrade Now
            </Link>
          )}
        </div>
      )}

      <div className="fixed top-36 right-4 z-50">
        <button
          onClick={toggleNotifications}
          className="btn btn-circle btn-primary relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 badge bg-red-500 badge-xs">
              {notifications.length}
            </span>
          )}
        </button>
        
        {showNotifications && (
           <div className="dropdown dropdown-end dropdown-open">
             <div className="menu dropdown-content mt-2 shadow-lg bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto">
               {notifications.length === 0 ? (
                 <div className="px-4 py-2 text-sm">No new notifications</div>
               ) : (
                 notifications.map(notification => (
                   <div
                     key={notification._id}
                     onClick={() => handleNotificationClick(
                       notification._id,
                       notification.contentId._id,
                       notification.contentId.topic,
                       notification.contentId.title,
                       notification.commentId
                     )}
                     className="hover:bg-base-200 cursor-pointer border-b border-base-300"
                   >
                     <div className="px-4 py-3">
                       <div className="font-medium">{notification.message}</div>
                       <div className="text-xs opacity-50 mt-1">
                         {new Date(notification.createdAt).toLocaleString()}
                       </div>
                     </div>
                   </div>
                 ))
               )}
               {notifications.length > 0 && (
                 <div className="px-4 py-2 bg-base-300 text-center text-xs sticky bottom-0">
                   Click to view and mark as read
                 </div>
               )}
             </div>
           </div>
        )}
      </div>


      <section className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 relative">
        <BinaryRainBackground />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">

          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase leading-tight">
                <span className="text-base-content">Master </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                  Data Structures
                </span>
                <span className="block text-base-content mt-2">& Algorithms</span>
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl my-8 text-base-content/70 max-w-xl mx-auto md:mx-0"
            >
              Your Journey To Coding Mastery Starts Here. Engage, Practice, Conquer.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
            >
              <Link to="/problems" className="btn btn-primary btn-lg group w-full sm:w-auto">
                Start Practicing
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
              
              {!isPremium && isAuthenticated && !loadingPremium && (
                <Link to="/upgrade" className="btn btn-lg group bg-gray-900 text-gray-100 border-gray-700 hover:bg-gray-800 hover:border-gray-600 shadow-lg transition-colors w-full sm:w-auto">
                  Upgrade to Premium
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </Link>
              )}
            </motion.div>
          </div>

     
          <motion.div 
            className="hidden md:flex w-full h-96"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8, type: 'spring' }}
          >
            <InteractiveArc />
          </motion.div>
        </div>
      </section>

  
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-base-300 to-transparent z-10"></div>
        <DataStructureCards />
      </div>

      <div>
        <BattlePromoSection/>
      </div>
      
      <HomePageMarquee />
      
      <Footer />
    </div>
  );
}

export default HomePage;
