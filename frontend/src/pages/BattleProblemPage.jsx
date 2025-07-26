
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Navigate, useParams,useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { FaPlay, FaCheck, FaTimes, FaExclamationTriangle, FaCode, FaTrophy } from 'react-icons/fa';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { NavLink } from 'react-router';
import ChatAI from '../Components/ChatAI';
import { FaFileAlt,FaBook,FaHistory,FaRobot,FaArrowLeft } from 'react-icons/fa';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router';
import { Link } from 'react-router';
import BattleChat from '../Components/BattleChat';
import userBadge from '../utils/userBadge';


const ProblemPage = () => {
  const { id } = useParams();
 // const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('problem');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [submissions, setSubmissions] = useState([]);
  const [runResults, setRunResults] = useState(null);
  const [submitResults, setSubmitResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmissionTab, setShowSubmissionTab] = useState(false);
  const [compilationError, setCompilationError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const editorRef = useRef(null);
  const consoleRef = useRef(null);
  const [viewingSubmissionCode, setViewingSubmissionCode] = useState(null);
  const [showEditor,setShowEditor] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [codeByLanguage, setCodeByLanguage] = useState({});
  const [battleResult, setBattleResult] = useState(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
   const [isBegin, setIsBegin] = useState(true);

  const handleStart = () => {
    setIsBegin(false);
  };

  const {socket} = useSelector((state)=>state.socket)
  const { user } = useSelector((state) => state.auth);
  const { state } = useLocation();

  const { problem, difficulty, commonTopics, battleId,player1,player2,battlesWon } = state || {};

  const currPlayer = user?._id === player1._id ? player1 : player2

  const anotherPlayer = user?._id === player1._id ? player2 : player1

  const initialTimeLeft = difficulty === "easy"
  ? 1800 
  : difficulty === "medium"
    ? 2700 
    : 3600; 

    const coinsBet = difficulty === "easy"
  ? 200 
  : difficulty === "medium"
    ? 1000 
    : 3000; 

    const currentBadge = userBadge(currPlayer.battlesWon)
    const anotherUserBadge = userBadge(anotherPlayer.battlesWon)


 const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

  console.log("problem:", problem)

  const navigate = useNavigate();

  const languageToMonacoId = {
    'C++': 'cpp',
    'Java': 'java',
    'JavaScript': 'javascript'
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    const initialCodes = {};
    problem.startCode.forEach(sc => {
        initialCodes[sc.language] = sc.initialCode || '';
    });
    setCodeByLanguage(initialCodes);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("User switched to another tab");
        socket.emit("tabChange",{status:"left"})
      } else if (document.visibilityState === "visible") {
        console.log("User came back to the site");
        socket.emit("tabChange",{status:"returned"})
      }
    };
    console.log("Page is mounted")
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

   useEffect(() => {
    if (!socket || !state) {
      navigate('/battlehomepage');
      return;
    }

    
    const onOpponentLeft = () => {
      setOpponentDisconnected(true);
      toast.success('Opponent disconnected! You win by default.');
      //setTimeout(() => navigate('/battlehomepage'), 9000);
    };

    const onBattleEnd = (result) => {
      setBattleResult(result);
      toast.success(result.winner === user._id ? 'You won the battle!' : 'Battle ended');
    };

    const onRunResult = (results) => {
      setSubmitResults(null);
      setCompilationError(null);
      setRunResults(results);
      setIsRunning(false);

      console.log("RunDone:", results)
    };

    const onSubmitResult = (results) => {
        setRunResults(null);
        setCompilationError(null);

        setSubmitResults(results);
        setIsSubmitting(false)
        setShowSubmissionTab(true);

        console.log("submittedresults:", results)
    }

    const onError = (data) => {
        toast.error(data)
    }

    const onRunError = (data) => {
        setCompilationError(data)
    }
 
    const onSubmitError = (data) => {
        setCompilationError(data)
    }

    socket.on('opponentLeft', onOpponentLeft);
    socket.on('battleEnd', onBattleEnd);
    socket.on('runresult', onRunResult);
    socket.on('submittedResult', onSubmitResult);
    socket.on('error', onError);
    socket.on('runError', onRunError);
    socket.on('submiterror',onSubmitError)

    return () => {
      socket.off('opponentLeft', onOpponentLeft);
      socket.off('battleEnd', onBattleEnd);
      socket.off('runResult', onRunResult);
      socket.off('submittedResult',onSubmitResult)
      socket.off('error', onError);
      socket.off('runError', onRunError);
      socket.off('submiterror',onSubmitError)
    };
  }, [socket, navigate, state, problem, language, user,runResults,submitResults]);

  const handleTimeExpired = () => {
 
  socket.emit('timeOver', { 
    battleId
  });
};

    const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
    
  useEffect(() => {
    if (!problem) return;

    const timer = setInterval(() => {
        setTimeLeft(prev => {
        if (prev <= 1) {
            clearInterval(timer);
            handleTimeExpired();
            return 0;
        }
        return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
    }, [problem]);

  useEffect(() => {
    if (consoleRef.current && (runResults || submitResults || compilationError)) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [runResults, submitResults, compilationError]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
  };

  const handleRunCode = async () => {
     if (!codeByLanguage[language]) return;
    
    setIsRunning(true);
    setRunResults(null)
    setSubmitResults(null)
    setCompilationError(null);

    console.log("Running1")
    
    socket.emit('runAnswer', { 
      battleId,
      answer: {
        code: codeByLanguage[language],
        language
      }
    });
  };

//console.log("runResults:", runResults)

  const handleSubmitCode = async () => {
    if (!codeByLanguage[language]) return;
    
    setIsSubmitting(true);
    setSubmitResults(null)
    setRunResults(null)
    setCompilationError(null);

    
    socket.emit('submitAnswer', { 
      battleId,
      answer: {
        code:codeByLanguage[language],
        language
      }
    });
  };

const copyToClipboard = (text) => 
  {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

const handleLike = async () =>{

     try{
       const result = await axiosClient.get(`/problem/likedProblem/${id}`);
       setIsLiked(!isLiked)
     }
     catch(err)
     {
        toast.error(err?.response?.data)
     }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-error';
      default: return 'badge-info';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-base-100">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );
  
 if (error) return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <div className="alert alert-error max-w-md shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-bold">Error loading Problem</h3>
                        <div className="text-xs">{error}</div>
                    </div>
                    <Link to="/" className="btn btn-sm btn-ghost">Back to Home</Link>
                </div>
            </div>
        );

// if(opponentDisconnected) return(
 
//     <div className='flex justify-center items-center'> Your Opponent Left The Match, You Won</div>

//   )
    
  
  if (!problem) return (
    <div className="flex justify-center items-center h-screen bg-base-100 text-base-content">
      Problem not found
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-base-100 text-base-content overflow-hidden fixed z-25 inset-0">
  
      {isMobileView && (
        <div className="flex items-center justify-between p-3 border-b border-base-300 bg-base-200">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">{problem.title}</h1>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="select select-sm select-bordered w-[100px]"
          >
            <option value="C++">C++</option>
            <option value="Java">Java</option>
            <option value="JavaScript">JavaScript</option>
          </select>
           <div className="flex">
                    <button
                      onClick={handleLike}
                      className={`text-[17px] ${isLiked ? "text-red-500" : "text-gray-400"} `}
                    >
                      {isLiked ? <FaHeart /> : <FaRegHeart/>}
                    </button>
                  </div>
        </div>
      )}

      
      {!isMobileView ? (
        <PanelGroup direction="horizontal" className="flex-1">
         
          <Panel defaultSize={40} minSize={20} collapsible={true}>
            <div className="h-full flex flex-col bg-base-200 border-r border-base-300">
             
              <div className="tabs tabs-boxed bg-base-200 px-2 pt-2">
                <button
                  className={`tab ${activeTab === 'problem' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('problem')}
                >
                  Description
                </button>
                 <button
                  className={`tab ${activeTab === 'BattleChat' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('BattleChat')}
                >
                   ChatWithOpponnet
                </button> 
              </div>
    
              <div className="flex-1 overflow-auto p-4">
                {activeTab === 'problem' && (
                  <div>
                    <h2 className='mb-2 text-2xl'>{problem.title}</h2>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`badge ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <span className="badge badge-outline">
                        {problem.tags}
                      </span>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-md font-semibold mb-3">Examples</h3>
                      {problem.visibleTestCases.map((testCase, index) => (
                        <div key={index} className="mb-5 bg-base-300 p-4 rounded-lg border border-base-content/10">
                          <div className="mb-3">
                            <div className="text-sm font-medium text-base-content/70 mb-1">Input:</div>
                            <pre className="bg-base-100 p-3 rounded text-sm font-mono overflow-x-auto">
                              {testCase.input}
                            </pre>
                          </div>
                          <div className="mb-3">
                            <div className="text-sm font-medium text-base-content/70 mb-1">Output:</div>
                            <pre className="bg-base-100 p-3 rounded text-sm font-mono overflow-x-auto">
                              {testCase.output}
                            </pre>
                          </div>
                          {testCase.explanation && (
                            <div>
                              <div className="text-sm font-medium text-base-content/70 mb-1">Explanation:</div>
                              <p className="text-sm">{testCase.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                

                  <div  style={{ display: activeTab === 'BattleChat' ? 'block' : 'none' }}>
                    <BattleChat battleId={battleId}/>
                  </div>
                
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-base-300 hover:bg-primary transition-colors" />
          
     
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
       
              <div className="flex items-center justify-between p-2 bg-base-200 border-b border-base-300 ">
                <div className="flex items-center space-x-3">
                  <FaCode className="text-primary" />
                  <h3 className="font-medium">Code Editor</h3>
                </div>
                 <div className="flex items-center space-x-4">
                    <div className="text-lg font-mono bg-gray-700 px-3 py-1 rounded">
                        <span className="font-bold">Time:</span> {formatTime(timeLeft)}
                    </div>
                    </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="select select-sm select-bordered bg-base-100"
                  >
                    <option value="C++">C++</option>
                    <option value="Java">Java</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                  <div className="flex space-x-1">
                    <button
                      onClick={handleLike}
                      className={`text-md ${isLiked ? "text-red-500" : "text-gray-400"} `}
                    >
                      {isLiked ? <FaHeart /> : <FaRegHeart/>}
                    </button>
                  </div>
                  <div className='text-md flex space-x-1 text-gray-400'>
                    <FiCopy onClick={()=>{copyToClipboard(codeByLanguage[language] )}} />
                    </div>
                </div>
              </div>

              <Panel defaultSize={70} minSize={30}>
                <div className="h-full bg-base-100">
                  <Editor
                    height="100%"
                    language={languageToMonacoId[language] || 'javascript'}
                    theme="vs-dark"
                     value={codeByLanguage[language] || ''}
                    onChange={(value) => {
                      setCodeByLanguage(prev => ({
                        ...prev,
                        [language]: value
                      }));
                    }}
                    onMount={handleEditorDidMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      renderWhitespace: 'selection',
                      wordWrap: 'on',
                      padding: { top: 10 },
                    }}
                  />
                </div>

              </Panel>
              
              <PanelResizeHandle className="h-1 bg-base-300 hover:bg-primary transition-colors" />
              
              <Panel defaultSize={30} minSize={10} collapsible={true}>
                <div className="h-full flex flex-col bg-base-200 border-t border-base-300">
                  <div className="flex justify-between items-center p-2 border-b border-base-300">
                    <h3 className="font-medium text-sm">Console</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className={`btn btn-sm ${isRunning ? 'btn-disabled' : 'btn-primary'}`}
                      >
                        <FaPlay size={12} />
                        <span>{isRunning ? 'Running...' : 'Run'}</span>
                      </button>
                      <button
                        onClick={handleSubmitCode}
                        disabled={isSubmitting}
                        className={`btn btn-sm ${isSubmitting ? 'btn-disabled' : 'btn-success'}`}
                      >
                        <FaCheck size={12} />
                        <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    ref={consoleRef}
                    className="flex-1 overflow-auto p-3 text-sm font-mono"
                  >
                    {compilationError && (
                      <div className="alert alert-error mb-4">
                        <FaExclamationTriangle />
                        <span>Compilation Error</span>
                        <pre className="whitespace-pre-wrap overflow-x-auto">
                          {compilationError}
                        </pre>
                      </div>
                    )}
                    
                    {runResults && (
                      <div className="space-y-4">
                        <h4 className="font-medium mb-2">Run Results</h4>
                        {runResults.map((result, index) => (
                          <div key={index} className="mb-3 bg-base-300 p-3 rounded-lg border border-base-content/10">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-medium">Test Case {index + 1}</span>
                              <span className={`badge ${
                                result.status_id === 3 ? 'text-success' : 'text-error'
                              }`}>
                                {result.status_id === 3 ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-base-content/70 mb-1">Input</div>
                                <pre className="bg-base-100 p-2 rounded whitespace-pre-wrap text-xs">
                                  {problem.visibleTestCases[index]?.input}
                                </pre>
                              </div>
                              
                              <div className="space-y-2">
                                <div>
                                  <div className="text-xs text-base-content/70 mb-1">Expected</div>
                                  <pre className="bg-base-100 p-2 rounded whitespace-pre-wrap text-xs">
                                    {problem.visibleTestCases[index]?.output}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-xs text-base-content/70 mb-1">Your Output</div>
                                  <pre className={`p-2 rounded whitespace-pre-wrap text-xs ${
                                    result.status_id === 3 ? 'bg-success' : 'bg-error'
                                  }`}>
                                    {result.stdout || 'No output'}
                                  </pre>
                                </div>
                              </div>
                            </div>
                            
                            {result.status_id !== 3 && (
                              <div className="mt-3">
                                <div className="text-xs text-base-content/70 mb-1">Error</div>
                                <pre className="bg-error p-2 rounded whitespace-pre-wrap text-xs">
                                  {result.description|| 'Wrong answer'}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      ) : (   
  <div className="flex flex-col h-full">
    {/* Mobile Tab Navigation - Top */}
    <div className="tabs tabs-boxed bg-base-200 px-2 pt-2 flex overflow-x-auto">
      <button
        className={`tab flex-1 ${activeTab === 'problem' ? 'tab-active' : ''}`}
        onClick={() => setActiveTab('problem')}
      >
        <FaFileAlt className="mr-1" />
        <span className="text-xs">Problem</span>
      </button>
      
      <button
        className={`tab flex-1 ${activeTab === 'BattleChat' ? 'tab-active' : ''}`}
        onClick={() => setActiveTab('BattleChat')}
      >
        <FaRobot className="mr-1" />
        <span className="text-xs">Battle Chat</span>
      </button>
    </div>

    {/* Mobile Content Area */}
    <div className="flex-1 overflow-auto p-3">
      {activeTab === 'problem' && (
        <div>
          <h2 className='mb-2 text-xl font-bold'>{problem.title}</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`badge ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="badge badge-outline">
              {problem.tags}
            </span>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: problem.description }} />
          </div>
          
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Examples</h3>
            {problem.visibleTestCases.map((testCase, index) => (
              <div key={index} className="mb-3 bg-base-300 p-3 rounded-lg border border-base-content/10">
                <div className="mb-2">
                  <div className="text-xs font-medium text-base-content/70 mb-1">Input:</div>
                  <pre className="bg-base-100 p-2 rounded text-xs font-mono overflow-x-auto">
                    {testCase.input}
                  </pre>
                </div>
                <div className="mb-2">
                  <div className="text-xs font-medium text-base-content/70 mb-1">Output:</div>
                  <pre className="bg-base-100 p-2 rounded text-xs font-mono overflow-x-auto">
                    {testCase.output}
                  </pre>
                </div>
                {testCase.explanation && (
                  <div>
                    <div className="text-xs font-medium text-base-content/70 mb-1">Explanation:</div>
                    <p className="text-xs">{testCase.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      

     
        <div className="h-full flex flex-col" style={{ display: activeTab === 'BattleChat' ? 'block' : 'none' }}>
          <div className="flex-1">
            <BattleChat mobileView={true} battleId={battleId}/>
          </div>
        </div>
    </div>

    {/* Mobile Editor Toggle */}
    <div className="btm-nav btm-nav-sm bg-base-200 border-t border-base-300 flex flex-col items-center mb-20">
      
      <button 
        className={`${showEditor ? 'active' : ''}`}
        onClick={() => setShowEditor(true)}
      >
        <FaCode />
      </button>
      <h3 className="btm-nav-label">Click Icon To Write Code</h3>
    </div>

    {/* Mobile Editor Panel */}
    {showEditor && (
      <div className="fixed inset-0 bg-base-100 z-50 flex flex-col">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-2 bg-base-200 border-b border-base-300">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowEditor(false)}
              className="btn btn-sm btn-ghost"
            >
              <FaArrowLeft />
            </button>
            <h3 className="font-medium">Code Editor</h3>
            <div className="flex items-center">
            <div className="text-xs font-mono bg-gray-700 px-1 py-1 rounded">
               Time: {formatTime(timeLeft)}
            </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="select select-xs select-bordered bg-base-100"
            >
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="JavaScript">JavaScript</option>
            </select>
            <div className='text-md flex space-x-1 text-gray-400'>
                    <FiCopy onClick={()=>{copyToClipboard(codeByLanguage[language] )}} />
                    </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={languageToMonacoId[language] || 'javascript'}
            theme="vs-dark"
            value={codeByLanguage[language] || ''}
            onChange={(value) => {
            setCodeByLanguage(prev => ({  
              ...prev,
              [language]: value
            }));
          }}
          onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              padding: { top: 8 },
            }}
          />
        </div>

        {/* Editor Footer */}
        <div className="flex justify-between p-2 bg-base-200 border-t border-base-300">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`btn btn-sm btn-primary flex-1 mr-1 ${isRunning ? 'loading' : ''}`}
          >
            {!isRunning && <FaPlay size={12} className="mr-1" />}
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={handleSubmitCode}
            disabled={isSubmitting}
            className={`btn btn-sm btn-success flex-1 ml-1 ${isSubmitting ? 'loading' : ''}`}
          >
            {!isSubmitting && <FaCheck size={12} className="mr-1" />}
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* Console Panel */}
        <div className="h-1/3 flex flex-col border-t border-base-300">
          <div className="flex justify-between items-center p-2 bg-base-200 border-b border-base-300">
            <h3 className="font-medium text-sm">Console</h3>
          </div>
          <div 
            ref={consoleRef}
            className="flex-1 overflow-auto p-2 text-xs font-mono"
          >
            {compilationError && (
              <div className="alert alert-error mb-3 p-2">
                <FaExclamationTriangle size={14} />
                <span className="text-xs">Compilation Error</span>
                <pre className="whitespace-pre-wrap overflow-x-auto text-xs">
                  {compilationError}
                </pre>
              </div>
            )}
            
            {runResults && (
              <div className="space-y-2">
                <h4 className="font-medium mb-1 text-sm">Run Results</h4>
                {runResults.map((result, index) => (
                  <div key={index} className="mb-2 bg-base-300 p-2 rounded-lg border border-base-content/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium">Case {index + 1}</span>
                      <span className={`badge badge-xs ${
                        result.status_id === 3 ? 'text-success' : 'text-error'
                      }`}>
                        {result.status_id === 3 ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div>
                        <div className="text-xs text-base-content/70 mb-0.5">Input</div>
                        <pre className="bg-base-100 p-1 rounded whitespace-pre-wrap text-xs">
                          {problem.visibleTestCases[index]?.input}
                        </pre>
                      </div>
                      
                      <div>
                        <div className="text-xs text-base-content/70 mb-0.5">Expected</div>
                        <pre className="bg-base-100 p-1 rounded whitespace-pre-wrap text-xs">
                          {problem.visibleTestCases[index]?.output}
                        </pre>
                      </div>
                      
                      <div>
                        <div className="text-xs text-base-content/70 mb-0.5">Your Output</div>
                        <pre className={`p-1 rounded whitespace-pre-wrap text-xs ${
                          result.status_id === 3 ? 'bg-success' : 'bg-error'
                        }`}>
                          {result.stdout || 'No output'}
                        </pre>
                      </div>
                    </div>
                    
                    {result.status_id !== 3 && (
                      <div className="mt-2">
                        <div className="text-xs text-base-content/70 mb-0.5">Error</div>
                        <pre className="bg-error p-1 rounded whitespace-pre-wrap text-xs">
                          {result.description || 'Wrong answer'}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
)}
      
      {/* Submission Results Modal */}
      {showSubmissionTab && submitResults && (
        <div className={`modal ${showSubmissionTab ? 'modal-open' : ''}`}>
          <div className="modal-box max-w-2xl bg-base-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Submission Result</h3>
              <button 
                onClick={() => setShowSubmissionTab(false)}
                className="btn btn-sm btn-circle"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`alert ${
                submitResults.accepted ? 'alert-success' : 'alert-error'
              }`}>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {submitResults.accepted ? <FaCheck size={20} /> : <FaExclamationTriangle size={20} />}
                      <span className="font-bold">
                        {submitResults.accepted ? 'Accepted' : 'Wrong Answer'}
                      </span>
                    </div>
                    <span className="text-sm">
                      {submitResults.testCasesPassed}/{submitResults.testCasesTotal} test cases passed
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="stats bg-base-300">
                  <div className="stat">
                    <div className="stat-title">Runtime</div>
                    <div className="stat-value text-primary text-lg">
                      {submitResults.runTime} ms
                    </div>
                  </div>
                </div>
                
                <div className="stats bg-base-300">
                  <div className="stat">
                    <div className="stat-title">Memory</div>
                    <div className="stat-value text-secondary text-lg">
                      {submitResults.memory} KB
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="stats bg-base-300">
                <div className="stat">
                  <div className="stat-title">Language</div>
                  <div className="stat-value text-lg">
                    {language}
                  </div>
                </div>
              </div>
              
              {!submitResults.accepted && (
                <div>
                  <h4 className="font-medium text-lg mb-2">First Test Cases Where Your Code Fails</h4>
                  <div className="space-y-3">
                    {submitResults.failedTestcase && (
                        <>
                <h3 className='text-xl text-error font-bold'>{submitResults.failedTestcase.errorMessage||"Wrong Answer"}</h3>
                      <div className="bg-base-300 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-1">Input</div>
                        <pre className="bg-base-100 p-2 rounded text-xs font-mono whitespace-pre-wrap">
                          {submitResults.failedTestcase.stdin}
                        </pre>
                        
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          <div>
                            <div className="text-sm font-medium mb-1">Expected</div>
                            <pre className="bg-base-100 p-2 rounded text-xs font-mono whitespace-pre-wrap">
                              {submitResults.failedTestcase.expected_output}
                            </pre>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Your Output</div>
                            <pre className="bg-error/20 p-2 rounded text-xs font-mono whitespace-pre-wrap">
                              {submitResults.failedTestcase.stdout|| 'No output'}
                            </pre>
                          </div>
                        </div>
                      </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="modal-action">
                <button 
                  onClick={() => {
                    setActiveTab('submissions');
                    setShowSubmissionTab(false);
                  }}
                  className="btn btn-ghost"
                >
                  View All Submissions
                </button>
                <button 
                  className="btn btn-primary"
                >
                    <NavLink to="/problems">Next Challenge</NavLink>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {battleResult && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-gray-800 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center">
                <FaTrophy className={`mr-2 ${
                  battleResult.winner === user._id ? 'text-yellow-400' : 'text-gray-400'
                }`} />
                {battleResult.winner === user._id ? 'Victory!' : 'Battle Ended'}
              </h3>
              <button 
                onClick={() => {
                  setBattleResult(null);
                  navigate('/battlehomepage');
                }}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`alert ${
                battleResult.winner === user._id ? 'alert-success' : 'alert-error'
              }`}>
                <div className="flex-1">
                  {battleResult.winner === user._id ? (
                    <span>Congratulations! You won the battle!</span>
                  ) : (
                    <span>You Lost.</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* <div className="stats bg-gray-700">
                  <div className="stat">
                    <div className="stat-title">Test Cases Passed</div>
                    <div className="stat-value text-lg">
                      {battleResult.testCasesPassed}/{battleResult.testCasesTotal}
                    </div>
                  </div>
                </div> */}
                
                <div className={`stats ${battleResult.winner === user._id ? "bg-yellow-500":"bg-gray-600"}`}>
                  <div className="stat">
                    <div className="stat-title text-base-300 text-md">Coins Earned</div>
                    <div className={`stat-value text-lg `}>
                      {battleResult.winner === user._id ? battleResult.coins : 0}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-action">
                <button 
                  onClick={() => navigate('/battlehomepage')}
                  className="btn btn-primary"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
       <div className={`modal ${isBegin ? 'modal-open' : ''} backdrop-blur-md`}>
  <div className="modal-box max-w-2xl bg-gray-900 border border-gray-700 rounded-xl p-0 overflow-hidden shadow-2xl shadow-cyan-500/20 relative">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-20 pointer-events-none"></div>
    
    <div className="relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMxMTEiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-20"></div>
      
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      
      <div className="relative z-10 p-8">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-8 tracking-widest uppercase">
          CHALLENGE
        </h2>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="absolute -inset-1"></div>
              <div className="relative w-24 h-24 rounded-full border-2 border-purple-500/50 overflow-hidden">
                <img 
                  src={currPlayer?.profilePic?.secureURL || "https://th.bing.com/th/id/OIP.-OwdeGjbVmQWf62Ynk9_8AHaHa?r=0&w=720&h=720&rs=1&pid=ImgDetMain"} 
                  alt={currPlayer?.firstName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://th.bing.com/th/id/OIP.-OwdeGjbVmQWf62Ynk9_8AHaHa?r=0&w=720&h=720&rs=1&pid=ImgDetMain";
                  }}
                />
              </div>
            </div>
            <h3 className="mt-2 text-xl font-bold text-gray-100 tracking-wider">
              {currPlayer?.firstName || "PLAYER 1"}
            </h3>
            <div className='flex items-center justify-center mb-1'>
                <span className='text-xs opacity-50'>{currentBadge.emoji}</span>
                <span className='text-xs opacity-50'>{currentBadge.name}</span>
            </div>
            <div className='flex items-center justify-center gap-2'>
                <span className="text-black font-bold text-xl rounded-full text-center flex justify-center items-center h-6 w-6 bg-amber-400">₡</span>
                <span className='text-3xl font-bold text-yellow-500'>{coinsBet}</span>
            </div>
          </div>
          
          <div className="relative mx-4">
            <div className="absolute -inset-4 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full border-2 border-gray-600 shadow-lg">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">VS</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="absolute -inset-1"></div>
              <div className="relative w-24 h-24 rounded-full border-2 border-cyan-500/50 overflow-hidden">
                <img 
                  src={anotherPlayer?.profilePic?.secureURL || "https://th.bing.com/th/id/OIP.-OwdeGjbVmQWf62Ynk9_8AHaHa?r=0&w=720&h=720&rs=1&pid=ImgDetMain"} 
                  alt={anotherPlayer?.firstName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://th.bing.com/th/id/OIP.-OwdeGjbVmQWf62Ynk9_8AHaHa?r=0&w=720&h=720&rs=1&pid=ImgDetMain";
                  }}
                />
              </div>
            </div>
            <h3 className="mt-2 text-xl font-bold text-gray-100 tracking-wider">
              {anotherPlayer?.firstName || "PLAYER 2"}
            </h3>
            <div className='flex items-center justify-center mb-1'>
                <span className='text-xs opacity-50'>{anotherUserBadge.emoji}</span>
                <span className='text-xs opacity-50'>{anotherUserBadge.name}</span>
            </div>
            <div className='flex items-center justify-center gap-2'>
                <span className="text-black font-bold text-xl rounded-full text-center flex justify-center items-center h-6 w-6 bg-amber-400">₡</span>
                <span className='text-3xl font-bold text-yellow-500'>{coinsBet}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <button 
            onClick={handleStart}
            className="relative overflow-hidden group px-10 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300"
          >
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-bold tracking-wider">
              Start Battle
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </button>
        </div>
        <h3 className='text-sm opacity-55 text-center mt-2'>Your Timer have already Started....</h3>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default ProblemPage;