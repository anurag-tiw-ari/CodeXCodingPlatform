function Footer() {
  return (
    <footer className="footer bg-neutral text-neutral-content py-25 px-15 border-t border-neutral-focus min-h-[120px] relative overflow-hidden">
      <div className="w-full flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              className="text-primary"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <h2 className="text-xl font-bold text-white">Codex Coding Platform</h2>
          </div>
          <p className="text-sm text-neutral-300">Master coding through immersive challenges</p>
        </div>
        <a 
          href="https://anuragtportfolio.netlify.app/" 
          target="_blank"
          className="group text-primary hover:text-primary-focus text-sm font-medium transition-colors flex items-center gap-1"
        >
          About the Developer
          <svg 
            className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </footer>
  );
}

export default Footer;