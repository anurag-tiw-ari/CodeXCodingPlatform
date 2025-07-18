import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { MdOutlineCreate, MdDeleteOutline } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";
import { IoMdStats } from "react-icons/io";
import StatsTab from "../Components/StatsTab";
import CreateTab from "../Components/createTab";
import UpdateTab from "../Components/updateTab";
import DeleteTab from "../Components/DeleteTab";
import VideoTab from "../Components/VideoTab";
import { useNavigate } from "react-router";
import { RiVideoOnAiLine } from "react-icons/ri";
import { IoCreateOutline } from "react-icons/io5";
import ContentTab from "../Components/ContentTab";
import { Link } from "react-router";


function AdminPage() {
    const [problems, setProblems] = useState([]);
    const [createdProblems, setCreatedProblems] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("stats");
    const [loading, setLoading] = useState(true);

   const navigate = useNavigate()

   useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
        try {
            const allProblems = await axiosClient.get('/problem/getAllProblem');
            setProblems(allProblems.data);

            if(user){
                const response = await axiosClient.get('/problem/problemCreatedByAdmin');
                setCreatedProblems(response.data);
            }
        } catch (err) {
            setError(err.response?.data);
        }
        finally
        {
            setLoading(false)
        }
    };

    fetchData();
}, [user]);

    if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
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
                            <h3 className="font-bold">Error loading page</h3>
                            <div className="text-xs">{error}</div>
                        </div>
                        <Link to="/" className="btn btn-sm btn-ghost">Back to Home</Link>
                    </div>
                </div>
            );
        }
    return (
        <div className="min-h-screen bg-base-200 pt-16 pb-8 mt-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between">
                     <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
                <button 
            onClick={() => navigate('/')}
            className="btn btn-ghost"
          >
            Back to HomePage
          </button>
                </div>

                {/* Mobile tabs */}
                <div className="md:hidden mb-6">
                    <select 
                        className="select select-bordered w-full"
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                    >
                        <option value="stats">Statistics</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="video">Video</option>
                        <option value="content">Content</option>
                    </select>
                </div>

                {/* Desktop tabs */}
                <div className="hidden md:block mb-6">
                    <div className="tabs tabs-boxed bg-base-100">
                        <button 
                            className={`tab ${activeTab === 'stats' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('stats')}
                        >
                            <IoMdStats className="mr-2" /> Statistics
                        </button>
                        <button 
                            className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('create')}
                        >
                            <MdOutlineCreate className="mr-2" /> Create
                        </button>
                        <button 
                            className={`tab ${activeTab === 'update' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('update')}
                        >
                            <RxUpdate className="mr-2" /> Update
                        </button>
                        <button 
                            className={`tab ${activeTab === 'delete' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('delete')}
                        >
                            <MdDeleteOutline className="mr-2" /> Delete
                        </button>
                        <button 
                            className={`tab ${activeTab === 'video' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('video')}
                        >
                            <RiVideoOnAiLine className="mr-2" /> Video
                        </button>
                         <button 
                            className={`tab ${activeTab === 'content' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('content')}
                        >
                            <IoCreateOutline className="mr-2" /> Content
                        </button>
                    </div>
                </div>

                {/* Content area */}
                <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
                    <div style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
                        <StatsTab problems={problems} createdProblems={createdProblems} />
                    </div>

                    <div style={{ display: activeTab === 'create' ? 'block' : 'none' }}>
                        <CreateTab />
                    </div>

                    <div style={{ display: activeTab === 'update' ? 'block' : 'none' }}>
                        <UpdateTab problems={problems} createdProblems={createdProblems} />
                    </div>

                    <div style={{ display: activeTab === 'delete' ? 'block' : 'none' }}>
                        <DeleteTab  problems={problems} createdProblems={createdProblems} />
                    </div>

                    <div style={{ display: activeTab === 'video' ? 'block' : 'none' }}>
                        <VideoTab  problems={problems} createdProblems={createdProblems} />
                    </div>
                    <div style={{ display: activeTab === 'content' ? 'block' : 'none' }}>
                        <ContentTab />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;