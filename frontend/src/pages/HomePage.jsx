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
    <div className="min-h-screen bg-base-300 mt-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>
      </div>
      
      {/* Premium Status Badge - Golden Matte for Premium */}
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

      {/* Rest of the notification code remains the same */}
      <div className="fixed top-30 right-4 z-50">
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
            <div className="menu dropdown-content mt-2 shadow-lg bg-base-100 rounded-box w-72">
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
                <div className="px-4 py-2 bg-base-300 text-center text-xs">
                  Click to view and mark as read
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <section className="min-h-screen flex justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="flex flex-col items-center max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
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
            className="text-xl sm:text-2xl my-6 text-base-content/70 max-w-2xl relative"
          >
            <span className="absolute -left-6 top-1/2 h-1 w-4 bg-secondary transform -translate-y-1/2"></span>
            Your Journey To Coding Mastery Starts Here
            <span className="absolute -right-6 top-1/2 h-1 w-4 bg-accent transform -translate-y-1/2"></span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col items-center space-y-8"
          >
            <Link 
              to="/problems" 
              className="btn btn-primary btn-lg group"
            >
              <span className="flex items-center gap-2">
                Start Practicing Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </span>
            </Link>
            
            {!isPremium && isAuthenticated && !loadingPremium && (
              <Link 
                to="/upgrade" 
                className="btn btn-lg group bg-gray-900 text-gray-100 border-gray-700 hover:bg-gray-800 hover:border-gray-600 shadow-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  Upgrade to Premium
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </span>
              </Link>
            )}
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-primary flex flex-col items-center"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
              <div className="h-8 w-px bg-gradient-to-b from-primary to-transparent"></div>
            </motion.div>
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