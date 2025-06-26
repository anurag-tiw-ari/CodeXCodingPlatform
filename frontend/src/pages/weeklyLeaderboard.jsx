
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient'; 
import userBadge from '../utils/userBadge'; 

const WeeklyLeaderboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeeklyLeaderboard = async () => {
      try {
        const response = await axiosClient.get('/leaderboard/battles/weeklyLB');
        setTopUsers(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data || 'Cannot load weekly leaderboard');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyLeaderboard();
  }, []);

  const defaultProfilePic = "https://th.bing.com/th/id/OIP.-OwdeGjbVmQWf62Ynk9_8AHaHa?r=0&w=720&h=720&rs=1&pid=ImgDetMain";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
        <div className='h-screen flex justify-center items-center'>
            <div className="alert alert-error max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
      </div>
        </div>
      
    );
  }

  if (!topUsers || topUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-base-200 rounded-lg p-6 mt-10">
        <div className="text-2xl font-bold text-center mb-4">Weekly Leaderboard</div>
        <div className="text-center text-gray-500 dark:text-gray-400">
          No participants this week. Be the first to join!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto mt-18">
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center mb-2 text-primary">
          <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Weekly Champions
          </span>
        </h2>

        <h4 className='text-sm opacity-50 text-center mb-4'>You have to win atleast one battle in curent week to appear in the top 10 list.</h4>
        
        <div className="space-y-4">
          {topUsers.map((userData, index) => {
            const badge = userBadge(userData.userId.battlesWon);
            const isCurrentUser = user && user._id === userData.userId._id.toString();
            const rankColors = [
              'bg-yellow-400 text-yellow-900', // 1st place
              'bg-gray-300 text-gray-700',     // 2nd place
              'bg-amber-600 text-amber-100',   // 3rd place
              'bg-primary text-primary-content' // 4th+ places
            ];
            const rankColor = rankColors[Math.min(index, 3)];

            return (
              <div 
                key={userData._id}
                onClick={() => navigate(isCurrentUser ? '/userprofile' : `/userprofile/${userData.userId._id}`)}
                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all hover:bg-base-300 ${isCurrentUser ? 'bg-primary/10' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-4 ${rankColor}`}>
                  {index + 1}
                </div>
                
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-primary">
                  <img 
                    src={userData.userId.profilePic?.secureURL || defaultProfilePic} 
                    alt={userData.userId.firstName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = defaultProfilePic;
                    }}
                  />
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-bold text-lg">{userData.userId.firstName}</span>
                    {badge && (
                      <span className="badge badge-sm badge-primary flex items-center gap-1">
                        <span>{badge.emoji}</span>
                        <span>{badge.name}</span>
                      </span>
                    )}
                    {isCurrentUser && (
                      <span className="badge badge-sm badge-info">You</span>
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm font-semibold text-secondary">
                      {userData.weeklyCoinsEarned.toLocaleString()} coins
                    </span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {userData.userId.battlesWon} battles won
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyLeaderboard;