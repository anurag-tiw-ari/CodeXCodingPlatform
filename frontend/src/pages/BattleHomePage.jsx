import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../utils/axiosClient';
import BattleBadge from '../Components/BattleBadge';
import battleRules from '../battleRules.json'
import badges from "../badges.json"
import { Link } from 'react-router';


const BattleHomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const {socket} = useSelector((state)=>state.socket)
  const [coins,setCoins] = useState(null)
  const [battlesPlayed,setBattlesPlayed] = useState(null)
  const [battlesWon,setBattlesWon] = useState(null)
  const [showRules,setShowRules] = useState(false)
  const [battleRanks,setBattleRanks] = useState(false)
  const [error,setError] = useState(null)
  const navigate = useNavigate();

  useEffect(()=>{
    
    const fetchCoins = async ()=>{
      try{
      const resp = await axiosClient.get('/user/battleinfo')
      setCoins(resp.data.coins)
      setBattlesPlayed(resp.data.battlesPlayed)
      setBattlesWon(resp.data.battlesWon)
    }
    catch(err)
    {
      setError(err.response?.data)
    }
    }
    fetchCoins()
  },[])

  // Available topics - should match your backend
  const topics = ['Array','String','Recursion','Basic Programming','Star Pattern','Maths','LinkedList','Tree','Graph','DP','Stack','Queue'];

  // Entry fees based on difficulty
  const entryFees = {
    easy: 200,
    medium: 1000,
    hard: 3000
  };

  // Difficulty data with colors and icons
  const difficultyData = {
    easy: {
      color: 'from-green-400 to-emerald-600',
      icon: '🛡️',
      label: 'Novice Arena'
    },
    medium: {
      color: 'from-yellow-400 to-amber-600',
      icon: '⚔️',
      label: 'Warrior Coliseum'
    },
    hard: {
      color: 'from-red-400 to-rose-600',
      icon: '🔥',
      label: 'Champion Gauntlet'
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Battle event listeners
    socket.on('battleStart', (data) => {
      setCoins(coins-entryFees[data.difficulty])
      setIsMatchmaking(false);
      navigate(`/battle/${data.battleId}`,{
        state: {
          problem: data.problem,
          difficulty: data.difficulty,
          commonTopics: data.commonTopics,
          battleId: data.battleId,
          player1:data.user1,
          player2:data.user2,
          battlesWon
        }
      });
    });

    socket.on('error', (error) => {
      setIsMatchmaking(false);
      toast.error(error.message);
    });

    socket.on('noPlayersFound', (data) => {
      setIsMatchmaking(false);
      toast.error(data.message);
    });

    return () => {
      socket.off('battleStart');
      socket.off('error');
      socket.off('noPlayersFound');
    };
  }, [socket, navigate]);

  const toggleTopic = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic) 
        : [...prev, topic]
    );
  };

  const handleStartBattle = () => {
    if (!selectedDifficulty) {
      toast.error('Please select a difficulty');
      return;
    }

    if (selectedTopics.length === 0) {
      toast.error('Select at least one topic');
      return;
    }

    if (user.coins < entryFees[selectedDifficulty]) {
      toast.error(`You need ${entryFees[selectedDifficulty]} coins to join this battle`);
      return;
    }

    setIsMatchmaking(true);
    
    // Emit to backend - matches your backend's expected format
    socket.emit('joinBattle', { 
      difficulty: selectedDifficulty, 
      topic: selectedTopics
    });

    toast.success(`Searching for opponent... (${selectedDifficulty})`);
  };

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 mt-15">
      {/* Animated background elements */}
      <div className="indicator">
  <span className="indicator-item status status-error"></span>
  <div className="btn btn-sm btn-error btn-soft ml-3">
    <Link to="/watch/ads">
    Watch Ads
    </Link>
  </div>
</div>
      <div className='flex justify-end gap-2'>
         <button 
              onClick={() => setShowRules(true)}
              className="btn btn-sm bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200"
            >
               Rules
            </button>
            <button 
              onClick={() => setBattleRanks(true)}
              className="btn btn-sm bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200"
            >
              All Badges
            </button>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with coins and XP */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8 pt-8"
        >
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              CODE ARENA
            </h1>
            <p className="text-gray-400 mt-2">Prove your skills in live coding battles</p>
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="flex items-center gap-3 bg-gray-800/80 px-4 py-2 rounded-full border border-amber-400/30 shadow-lg">
              <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-black font-bold text-xl">₡</span>
              </div>
              <div>
                <p className="text-xs text-gray-400">BATTLE COINS</p>
                <span className="text-2xl font-bold text-amber-400">{coins || 0}</span>
              </div>
            </div>
            <BattleBadge battlesWon={battlesWon}/>
          </div>
        </motion.div>

        {/* Main Battle Card */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="card bg-gray-800/70 backdrop-blur-sm border border-gray-700 shadow-2xl overflow-hidden relative"
        >
          {/* Glow effect based on selected difficulty */}
          {selectedDifficulty && (
            <div className={`absolute inset-0 bg-gradient-to-br ${difficultyData[selectedDifficulty].color} opacity-10 pointer-events-none`} />
          )}
          
          <div className="card-body p-8">
            <h2 className="card-title text-4xl mb-2 font-extrabold bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
              BATTLEGROUND SETUP
            </h2>
            <p className="text-gray-400 mb-8">Choose your challenge and prepare for combat</p>
            
            {/* Difficulty Selector */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="text-purple-400">⚔️</span>
                <span>SELECT YOUR ARENA</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {['easy', 'medium', 'hard'].map((difficulty) => (
                  <motion.button
                    key={difficulty}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative overflow-hidden rounded-xl p-6 text-left border-2 transition-all duration-300 ${
                      selectedDifficulty === difficulty 
                        ? difficulty === 'easy' 
                          ? 'border-green-400 bg-green-900/20' 
                          : difficulty === 'medium' 
                            ? 'border-amber-400 bg-amber-900/20' 
                            : 'border-red-400 bg-rose-900/20'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                    }`}
                    onClick={() => setSelectedDifficulty(difficulty)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-3xl mb-2">{difficultyData[difficulty].icon}</div>
                        <h4 className="text-xl font-bold capitalize mb-1">{difficulty}</h4>
                        <p className="text-sm text-gray-400">{difficultyData[difficulty].label}</p>
                      </div>
                      <div className="text-2xl font-bold text-amber-400">
                        ₡{entryFees[difficulty]}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• {difficulty === 'easy' ? '30 min time limit' : difficulty === 'medium' ? '45 min time limit' : '60 min time limit'}</li>
                        <li>• {difficulty === 'easy' ? '2x coins for win' : difficulty === 'medium' ? '2x coins for win' : '2x coins for win'}</li>
                      </ul>
                    </div>
                    {selectedDifficulty === difficulty && (
                      <motion.div 
                        className={`absolute inset-0 border-2 ${
                          difficulty === 'easy' ? 'border-green-400' 
                          : difficulty === 'medium' ? 'border-amber-400' 
                          : 'border-red-400'
                        } rounded-xl pointer-events-none`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Topic Selection */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="text-purple-400">📚</span>
                <span>CHOOSE YOUR WEAPONS ({selectedTopics.length})</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {topics.map((topic) => (
                  <motion.button
                    key={topic}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      selectedTopics.includes(topic) 
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20' 
                        : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => toggleTopic(topic)}
                  >
                    <div className="flex items-center gap-2">
                      {topic}
                      {selectedTopics.includes(topic) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-purple-200"
                        >
                          ✓
                        </motion.span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="card-actions justify-center mt-12">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`btn btn-lg px-12 rounded-full text-xl font-bold ${
                  selectedDifficulty === 'easy' ? 'bg-gradient-to-r from-green-400 to-emerald-600' :
                  selectedDifficulty === 'medium' ? 'bg-gradient-to-r from-amber-400 to-orange-600' :
                  selectedDifficulty === 'hard' ? 'bg-gradient-to-r from-red-400 to-rose-600' :
                  'bg-gradient-to-r from-purple-500 to-cyan-500'
                } border-none shadow-lg ${isMatchmaking ? 'animate-pulse' : ''}`}
                onClick={handleStartBattle}
                disabled={isMatchmaking || !selectedDifficulty || selectedTopics.length === 0}
              >
                <AnimatePresence mode="wait">
                  {isMatchmaking ? (
                    <motion.span
                      key="searching"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      SCANNING ARENAS...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      ⚔️ ENTER THE ARENA
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>
                <AnimatePresence>
        {showRules && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRules(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
                    Battle Rules
                  </h3>
                  <button 
                    onClick={() => setShowRules(false)}
                    className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {battleRules.map((rule, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="text-2xl mt-1">{rule.icon}</div>
                      <div>
                        <h4 className="font-bold text-purple-300">{rule.title}</h4>
                        <p className="text-gray-300 text-sm">{rule.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-800">
                  <button 
                    onClick={() => setShowRules(false)}
                    className="btn btn-primary w-full"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
  {battleRanks && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={() => setBattleRanks(false)}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
              Battle Ranks
            </h3>
            <button 
              onClick={() => setBattleRanks(false)}
              className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {badges.map((rank, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border bg-gray-800/50 border-gray-700`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{rank.emoji}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className={`font-bold text-gray-200`}>
                        {rank.name}
                      </h4>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                        {rank.battlesWonStart}+ wins
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{rank.description}</p>
                    
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <button 
              onClick={() => setBattleRanks(false)}
              className="btn btn-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      </div>
    </div>
  );
};

export default BattleHomePage;