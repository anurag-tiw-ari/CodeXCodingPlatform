import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import axiosClient from '../utils/axiosClient';

const ThemeToggle = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const premRes = await axiosClient.get("/user/premium");
        setIsPremium(premRes.data.premium);
      } catch (error) {
        console.error("Error checking premium status:", error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkPremiumStatus();
  }, []);

  console.log(isPremium)

  const themeCategories = [
    {
      name: "Basic",
      themes: ['light', 'dark', 'cupcake', 'bumblebee', 'emerald']
    },
    {
      name: "Modern",
      themes: ['corporate', 'synthwave', 'retro', 'cyberpunk', 'valentine']
    },
    {
      name: "Nature",
      themes: ['garden', 'forest', 'aqua', 'autumn', 'winter']
    },
    {
      name: "Special",
      themes: ['halloween', 'dracula', 'coffee', 'night', 'dim']
    },
    {
      name: "Elegant",
      themes: ['luxury', 'black', 'business', 'pastel', 'fantasy']
    },
    {
      name: "Unique",
      themes: ['wireframe', 'acid', 'lemonade', 'nord', 'sunset']
    }
  ];

  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || (isPremium ? 'light' : 'dark');
    }
    return isPremium ? 'light' : 'dark';
  });

  const [activeCategory, setActiveCategory] = useState("Basic");

  useEffect(() => {
    if (!isPremium) {
      setCurrentTheme('dark');
      setActiveCategory("Basic");
    }
  }, [isPremium]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const getActiveThemes = () => {
    if (!isPremium) return ['dark'];
    
    const category = themeCategories.find(cat => cat.name === activeCategory);
    return category ? category.themes : [];
  };

  if (loading) {
    return <div className="text-center p-8">Loading theme preferences...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto mt-18">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Theme Selector</h1>
        <p className="text-lg opacity-80">
          {isPremium ? "Choose your preferred interface style" : "Upgrade to Premium to unlock all themes"}
        </p>
      </div>

      {!isPremium && (
        <div className="alert alert-warning mb-8 max-w-md mx-auto">
          <div className="flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <label>You need Premium to access all themes</label>
          </div>
          <div className="flex-none">
            <Link to="/upgrade" className="btn btn-sm btn-primary">
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      <div className="mb-8 p-4 bg-base-200 rounded-box">
        {isPremium && (
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {themeCategories.map((category) => (
              <button
                key={category.name}
                className={`btn btn-sm ${activeCategory === category.name ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {getActiveThemes().map((theme) => (
            <button
              key={theme}
              className={`btn h-24 flex-col gap-2 ${currentTheme === theme ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCurrentTheme(theme)}
              data-theme={theme}
              disabled={!isPremium && theme !== 'dark'}
            >
              <div className="w-6 h-6 rounded-full" style={{ 
                backgroundColor: `hsl(var(--${theme === 'light' ? 'primary' : theme}-color))` 
              }} />
              <span className="text-md font-medium capitalize">{theme}</span>
             
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="stats shadow bg-base-100 inline-block">
          <div className="stat">
            <div className="stat-title">Current Theme</div>
            <div className="stat-value capitalize">{currentTheme}</div>
            <div className="stat-desc">
              {isPremium ? "Applied to your session" : "Free users can only use dark theme"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm opacity-70">
        <p>
          {isPremium 
            ? "Your selection will be remembered for your next visit"
            : "Upgrade to Premium to unlock all themes and customization options"}
        </p>
      </div>

      {!isPremium && (
        <div className="text-center mt-6">
          <Link to="/upgrade" className="btn btn-primary">
            Upgrade to Premium
          </Link>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;