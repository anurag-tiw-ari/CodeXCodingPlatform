import { Navigate, Route,Routes } from "react-router";
import HomePage from "./pages/HomePage";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import { useDispatch,useSelector } from "react-redux";
import { checkAuth } from "./authSlice.js";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Header from "./Components/Header.jsx";
import Problems from "./pages/Problems.jsx";
import Footer from "./Components/Footer.jsx";
import ProblemPage from "./pages/ProblemPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import YearHeatmap from "./Components/heatMap.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import TopicContent from "./pages/TopicContent.jsx"
import ArticlePage from "./pages/ArticlePage.jsx";
import AnotherUserProfile from "./pages/AnotherUserProfile.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import { setSocket } from "./socketSlice.js";
import { io } from "socket.io-client";
import BattleHomePage from "./pages/BattleHomePage.jsx";
import BattleArena from "./pages/BattleProblemPage.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import WeeklyLeaderboard from "./pages/weeklyLeaderboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import WatchAd from "./pages/Ads.jsx";

function App()
{

  const {isAuthenticated,message,loading,user} = useSelector((state)=>state.auth)
  const {socket} = useSelector((state)=>state.socket)

  console.log("socket", socket)
  
  const dispatch = useDispatch();


  useEffect(()=>{
     dispatch(checkAuth())
  },[])

  useEffect(()=>{
      if(message)
      {
        toast.success(message);
      }
  },[message])

    useEffect(() => {
    if (isAuthenticated) {
      
      const socket = io("https://codexcodingplatform.onrender.com", {
        query: {
          userId: user._id
        }
      });

      dispatch(setSocket(socket));
      
      return () => {
        socket.disconnect();
      };
    }
  

    else {
      if(socket){
           socket.close();
           dispatch(setSocket(null))
      }
    }
  }, [isAuthenticated,dispatch]);

  if(loading)
  {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }


  return (
    <>
    <Header />
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LogInPage/>} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/problems" /> : <SignUpPage/>} />
        <Route path="/problems" element={isAuthenticated ? <Problems/> : <Navigate to="/signup"/>} />
        <Route path="/problem/:id" element={<ProblemPage/>}/>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/userprofile" element={<UserProfile />}></Route>
        <Route path="/userprofile/:id" element={<AnotherUserProfile />}></Route>
        <Route path="/content/:topic" element ={<TopicContent />}></Route>
        <Route path="/content/:topic/:id" element ={<ArticlePage />}></Route>
        <Route path="*" element={<PageNotFound />}></Route>
        <Route path="/battlehomepage" element={<BattleHomePage />}></Route>
        <Route path="/battle/:id" element={<BattleArena />}></Route>
        <Route path="/user/editprofile" element={<EditProfile />}></Route>
        <Route path="/battle/weeklyleaderboard" element={<WeeklyLeaderboard />}></Route>
        <Route path="/user/forgotpassword" element={<ForgotPassword />}></Route>
        <Route path="/watch/ads" element={<WatchAd />}></Route>
      </Routes>

    </>
  )
}

export default App;