import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import YearHeatmap from "../Components/heatMap";
import axiosClient from "../utils/axiosClient";
import { useParams } from "react-router";
import { Link } from "react-router";

function AnotherUserProfile() {
    const [total, setTotal] = useState([]);
    const [solved, setSolved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    const [error,setError] = useState(null)
   // const [streak,setStreak] = useState({curr:0,max:0})
  //  const { user } = useSelector((state) => state.auth);
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/user/getProfile/${id}`);
                setUser(response.data);
                
                const problemsRes = await axiosClient.get('/problem/getAllProblem');
                setTotal(problemsRes.data);
                
                const solvedRes = await axiosClient.get(`/problem/solvedProblemsByAnotherUser/${id}`);
                setSolved(solvedRes.data);

                // Check if current user is following this user
                
                const followingStatus = await axiosClient.get(`/user/isfollowing/${id}`);
                setIsFollowing(followingStatus.data);

                // const streakResp = await axiosClient.get(`/user/streak/anotheruser/${id}`);
                // setStreak((prev)=>{return {...prev,curr: streakResp.data.currStreak,max:streakResp.data.maxStreak}})
                
            } 
            catch (error) 
            {
                //console.error('Error fetching data:', error);
                setError(error.response)
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const difficultyStats = (totalProblems, solvedProblems) => {
        const difficulties = ['easy', 'medium', 'hard'];
        return difficulties.map(difficulty => {
            const total = totalProblems.filter(p => p.difficulty === difficulty).length;
            const solved = solvedProblems.filter(p => p.difficulty === difficulty).length;
            const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
            
            return {
                difficulty,
                total,
                solved,
                percentage
            };
        });
    };

    const handleFollow = async () => {
        try {
            setIsLoadingFollow(true);
            if (isFollowing) {
                await axiosClient.post(`/user/startunfollow/${id}`);
            } else {
                await axiosClient.post(`/user/startfollow/${id}`);
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error('Error updating follow status:', error);
        } finally {
            setIsLoadingFollow(false);
        }
    };

    const stats = difficultyStats(total, solved);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-base-100">
                    <div className="alert alert-error max-w-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-bold">Error loading profile</h3>
                            <div className="text-xs">{error?.data}</div>
                        </div>
                        <Link to="/" className="btn btn-sm btn-ghost">Back to Home</Link>
                    </div>
                </div>
            );
        }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 mt-15" data-theme="dark">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-shrink-0">
                    {user ? (
                        <div className="w-32 h-32 rounded-full bg-neutral flex items-center justify-center overflow-hidden">
                        <img 
                            src={user.profilePic.secureURL || "https://th.bing.com/th/id/OIP.-OwdeGjbVmQWf62Ynk9_8AHaHa?r=0&w=720&h=720&rs=1&pid=ImgDetMain"}
                            alt="User" 
                            className="w-32 h-32 rounded-full object-cover"
                        />
                        </div>
                    ) : (
                        <img 
                            src="https://th.bing.com/th/id/OIP.-OwdeGjbVmQWf62Ynk9_8AHaHa?r=0&w=720&h=720&rs=1&pid=ImgDetMain" 
                            alt="Default user" 
                            className="w-32 h-32 rounded-full object-cover"
                        />
                    )}
                </div>
                
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {user ? `${user.firstName}` : 'Anonymous User'}
                            </h1>
                        </div>
                        
                            <button 
                                onClick={handleFollow}
                                disabled={isLoadingFollow}
                                className={`btn btn-sm mb-2 ${isFollowing ? 'btn-error' : 'btn-primary'} ${isLoadingFollow ? 'loading' : ''}`}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="bg-base-200 p-4 rounded-lg shadow-sm border border-base-300 flex-1 min-w-[200px]">
                            <h3 className="text-sm font-medium">Total Solved</h3>
                            <p className="text-2xl font-bold text-primary">{solved.length}</p>
                        </div>
                        <div className="bg-base-200 p-4 rounded-lg shadow-sm border border-base-300 flex-1 min-w-[200px]">
                            <h3 className="text-sm font-medium">Total Problems</h3>
                            <p className="text-2xl font-bold text-secondary">{total.length}</p>
                        </div>
                        <div className="bg-base-200 p-4 rounded-lg shadow-sm border border-base-300 flex-1 min-w-[200px]">
                            <h3 className="text-sm font-medium">Accuracy</h3>
                            <p className="text-2xl font-bold text-accent">
                                {total.length > 0 ? Math.round((solved.length / total.length) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                
                <div className="flex items-center gap-4 mt-4">
  {/* Followers Button */}
                <div className="tooltip" data-tip="Followers list is private">
                    <button 
                    onClick={() => window.alert("You cannot see other user's Followers")}
                    className="btn btn-sm btn-outline hover:bg-base-200 flex items-center gap-2"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">Followers: {user.followers.length}</span>
                    </button>
                </div>

        {/* Following Button */}
        <div className="tooltip" data-tip="Following list is private">
            <button 
            onClick={() => window.alert("You cannot see other user's Following")}
            className="btn btn-sm btn-outline hover:bg-base-200 flex items-center gap-2"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-medium">Following: {user.following.length}</span>
            </button>
        </div>

            {/* Coding Score with Visual Indicator */}
            <div className="tooltip" data-tip="Coding Activity Score">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-base-300 rounded-box border border-base-content/10">
                    <div className="text-lg font-bold text-primary">{user.codingScore}</div>
                    <span className="text-sm opacity-80">Coding Score</span>
                </div>
                </div>
            </div>
                </div>
            </div>

            <div className="card w-full bg-base-200 shadow-xl mb-10">
  <div className="card-body p-4 sm:p-6">
    <div className="stats stats-vertical lg:stats-horizontal bg-base-300">
      <div className="stat">
        <div className="stat-figure text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </div>
        <div className="stat-title text-base-content/80">Current Streak</div>
        <div className="stat-value text-primary">{user.streak.current}</div>
        <div className="stat-desc text-base-content/60">days in a row</div>
      </div>
      
      <div className="stat">
        <div className="stat-figure text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
          </svg>
        </div>
        <div className="stat-title text-base-content/80">Max Streak</div>
        <div className="stat-value text-secondary">{user.streak.max}</div>
        <div className="stat-desc text-base-content/60">all-time record</div>
      </div>
    </div>
  </div>
            </div>


            {/* Heatmap Section */}
            <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-neutral-content">Activity Heatmap</h2>
                <div className="overflow-x-auto">
                    <YearHeatmap id={id} />
                </div>
            </div>

            {/* Difficulty Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="capitalize text-lg font-semibold">
                                {stat.difficulty}
                            </h3>
                            <span className="text-sm">
                                {stat.solved}/{stat.total} ({stat.percentage}%)
                            </span>
                        </div>
                        <div className="w-full bg-neutral rounded-full h-2.5">
                            <div 
                                className={`h-2.5 rounded-full ${
                                    stat.difficulty === 'easy' ? 'bg-success' :
                                    stat.difficulty === 'medium' ? 'bg-warning' : 'bg-error'
                                }`} 
                                style={{ width: `${stat.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                {solved.length > 0 ? (
                    <ul className="space-y-3">
                        {solved.slice(0, 5).map((problem, index) => (
                            <li key={index} className="flex items-center p-3 hover:bg-base-300 rounded-lg transition-colors">
                                <span className={`w-3 h-3 rounded-full mr-3 ${
                                    problem.difficulty === 'easy' ? 'bg-success' :
                                    problem.difficulty === 'medium' ? 'bg-warning' : 'bg-error'
                                }`}></span>
                                <span className="font-medium flex-1 text-neutral-content">{problem.title}</span>
                                <span className="text-sm capitalize">{problem.difficulty}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-neutral">No recent activity</p>
                )}
            </div>
        </div>
    );
}

export default AnotherUserProfile;
