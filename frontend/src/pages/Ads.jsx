import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { useRef } from "react";
import { toast } from "react-toastify";
import video1 from "../assets/adsVideos/videoplayback (1).mp4"
import video2 from "../assets/adsVideos/videoplayback (2).mp4"
import video3 from "../assets/adsVideos/videoplayback (3).mp4"
import video4 from "../assets/adsVideos/videoplayback (4).mp4"

function WatchAd() {
  const [showAd, setShowAd] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [duration,setDuration] = useState(0)

      const intervalRef = useRef(null);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handlePlay = () => {
        // Clear any existing interval first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setDuration((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

  const videoArray = [
    video1,video2,video3,video4
  ];

  const handleWatch = () => {
    setShowAd(true);
    setRewardClaimed(false);
    const id = videoArray[Math.floor(Math.random() * videoArray.length)];
    setVideoId(id);
  };

  const handleAdEnd = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.put("/watch/ads");
      if (response.status === 201) {
        toast.success("500 coins added to your account!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setRewardClaimed(true);
      
    }

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add coins", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setShowAd(false);
      setIsLoading(false);
    }
  };

  const handleCloseAd = () => {
    setShowAd(false);
    toast.warning("Please watch the full ad to receive coins", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Earn Free Coins</h1>
          <p className="py-6">
            Watch a short video ad and earn 500 coins for your account!
          </p>

          {!showAd && (
            <button
              onClick={handleWatch}
              disabled={isLoading}
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            >
              {rewardClaimed ? 'Watch Another Ad' : 'Watch Ad & Get 500 Coins'}
            </button>
          )}

          {showAd && (
            <div className="card bg-base-100 shadow-xl mt-6">
              <div className="card-body">
                <div className="relative aspect-w-16 aspect-h-9">
                   <video
                        src={videoId}
                        autoPlay
                        onEnded={handleAdEnd}
                        onLoadedMetadata={(e) => {
                        setDuration(e.currentTarget.duration);
                        }
                    }
                         onPlay={handlePlay}
                    />
                    
                        <div>{`Rewards in: ${Math.floor(duration)} seconds`}</div>
                  

                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Please watch the full video to receive your coins</p>
                </div>
                <div className="card-actions justify-end">
                  <button
                    onClick={handleCloseAd}
                    className="btn btn-sm btn-ghost"
                  >
                    Close Ad
                  </button>
                </div>
              </div>
            </div>
          )}

          {rewardClaimed && !showAd && (
            <div className="alert alert-success mt-6">
              <div className="flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <label>Your coins have been successfully added!</label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WatchAd;