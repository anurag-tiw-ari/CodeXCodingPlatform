import { useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import CountdownTimer from '../Components/CountDownTimer';

function Problems() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [likedProblems, setLikedProblems] = useState([]);
  const [POTD, setPOTD] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });
  const [percentageValue, setPercentageValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Fetch all problems and other data
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchPOTD = async () => {
      try {
        const { data } = await axiosClient.get('/problem/potd');
        setPOTD(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/solvedProblemsByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    const fetchLikedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/likedProblemsByUser');
        setLikedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    fetchPOTD();
    if (user) {
      fetchSolvedProblems();
      fetchLikedProblems();
    }
  }, [user]);

  const handleSearch = useCallback(async (query) => {
    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await axiosClient.get(`/problem/search/problem?keyword=${query}`);
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching problems:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);


  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (searchQuery.trim() !== '') {
      setDebounceTimer(
        setTimeout(() => {
          handleSearch(searchQuery);
        }, 500)
      );
    } else {
      setSearchResults([]);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchQuery, handleSearch]);

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id)) || 
      (filters.status === 'liked' && likedProblems.some(lp => lp._id === problem._id));
    return difficultyMatch && tagMatch && statusMatch;
  });

  const solvedNumber = filteredProblems.filter((problem) =>
    solvedProblems.some(sp => sp._id === problem._id)
  ).length;

  useEffect(() => {
    if (filteredProblems.length !== 0) { 
      setPercentageValue((solvedNumber / filteredProblems.length) * 100);
    } else {
      setPercentageValue(0);
    }
  }, [filters, solvedNumber, filteredProblems]);

  return (
    <div className="min-h-screen bg-base-200 pt-20">
      <div className="container mx-auto px-4 py-8">
    
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-primary">Problem Set</h1>
            <p className="text-base-content/70 mt-2">Practice to improve your skills</p>
          </div>
          
 
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search problems..."
              className="input input-bordered w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
    
            {searchQuery && (
              <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <span className="loading loading-spinner loading-md"></span>
                    <p>Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="py-1">
                    {searchResults.map((problem) => (
                      <li key={problem._id}>
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span>{problem.title}</span>
                            <span className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-700">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-base-100 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Problems</option>
                <option value="solved">Solved Problems</option>
                <option value="liked">Liked Problems</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="label">
                <span className="label-text">Difficulty</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="label">
                <span className="label-text">Tags</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={filters.tag}
                onChange={(e) => setFilters({...filters, tag: e.target.value})}
              >
                <option value="all">All Tags</option>
                <option value="Array">Array</option>
                <option value="String">String</option>
                <option value="Recursion">Recursion</option>
                <option value="Basic Programming">Basic Programming</option>
                <option value="Star Pattern">Star Pattern</option>
                <option value="Maths">Maths</option>
                <option value="LinkedList">Linked List</option>
                <option value="Tree">Tree</option>
                <option value="Graph">Graph</option>
                <option value="DP">DP</option>
                <option value="Stack">Stack</option>
                <option value="Queue">Queue</option>
              </select>
            </div>
          </div>


          <div className="flex flex-col items-center">
            <div className="w-full max-w-md">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">
                  {solvedNumber}/{filteredProblems.length} solved
                </span>
                <span className="text-sm font-medium">
                  {percentageValue.toFixed(0)}%
                </span>
              </div>
              <progress 
                className="progress progress-primary w-full h-3" 
                value={percentageValue} 
                max="100"
              ></progress>
            </div>
          </div>
        </div>

        {POTD && (
          <div className="card bg-primary/80 shadow-md hover:shadow-xl transition-shadow mb-6">
            <div className="card-body p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="badge badge-info mb-2">Problem of the Day</div>
                  <h2 className="card-title text-lg">
                    <NavLink 
                      to={`/problem/${POTD?._id}`} 
                      className="hover:text-white transition-colors"
                    >
                      {POTD?.title}
                    </NavLink>
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className={`badge ${getDifficultyBadgeColor(POTD?.difficulty)}`}>
                      {POTD?.difficulty}
                    </div>
                    <div className="badge badge-outline">
                      {POTD?.tags}
                    </div>
                  </div>
                </div>
                <CountdownTimer />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredProblems.length > 0 ? (
            filteredProblems.map(problem => (
              <div key={problem._id} className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow hover:border-l-4 hover:border-primary">
                <div className="card-body p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="card-title text-lg">
                        <NavLink 
                          to={`/problem/${problem._id}`} 
                          className="hover:text-primary transition-colors"
                        >
                          {problem.title}
                        </NavLink>
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)} border-gray-700`}>
                          {problem.difficulty}
                        </div>
                        <div className="badge border-gray-700">
                          {problem.tags}
                        </div>
                      </div>
                    </div>
                    
                    {solvedProblems.some(sp => sp._id === problem._id) ? (
                      <div className="badge badge-success gap-2 px-4 py-3 hover:bg-green-300">
                        Solved
                      </div>
                    ) : ( 
                      <div className="badge bg-white gap-2 px-5 py-3 text-green-950 hover:bg-green-300">
                        <NavLink to={`/problem/${problem._id}`}>
                          Solve
                        </NavLink>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-base-100 rounded-xl shadow">
              <div className="text-5xl mb-4">🧐</div>
              <h3 className="text-xl font-medium">No problems found</h3>
              <p className="text-base-content/70">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Problems;