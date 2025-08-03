import { motion } from 'framer-motion';

const ConceptNode = ({ text }) => (
  <motion.div
    className="absolute"
    whileHover={{ scale: 1.5 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="relative group flex items-center justify-center">
   
      <div className="absolute w-3 h-3 rounded-full bg-secondary/50 animate-ping"></div>
   
      <div className="relative w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_theme(colors.secondary),0_0_12px_theme(colors.secondary)] cursor-pointer"></div>
   
      <div className="absolute bottom-full mb-3 w-max px-3 py-1.5 bg-base-100 text-base-content text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg z-10">
        {text}
      </div>
    </div>
  </motion.div>
);


const InteractiveArc = () => {

  const arcPath = "M 50,250 A 200,200 0 0 1 450,250";

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 500 280"
        className="w-full h-full absolute"
        style={{ transform: 'translateY(10%)' }}
      >
     
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--fallback-p, oklch(var(--p)))" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--fallback-p, oklch(var(--p)))" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--fallback-p, oklch(var(--p)))" stopOpacity="0" />
          </linearGradient>
        </defs>


        <path d={arcPath} stroke="url(#arcGradient)" strokeWidth="2" fill="none" transform="scale(1.0)" transform-origin="center" />
        <path d={arcPath} stroke="url(#arcGradient)" strokeWidth="1.5" fill="none" transform="scale(0.75)" transform-origin="center" />
        <path d={arcPath} stroke="url(#arcGradient)" strokeWidth="1" fill="none" transform="scale(0.5)" transform-origin="center" />
      </svg>


      <motion.div
        className="absolute w-full h-full"
        style={{ transform: 'translateY(10%) scale(1.0)' }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-[calc(50%-1.5rem)] left-[-0.375rem] transform -translate-y-1/2">
            <ConceptNode text="Graphs & Traversal" />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute w-[75%] h-[75%]"
        style={{ transform: 'translateY(13.3%)' }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-[calc(50%-1.5rem)] left-[-0.375rem] transform -translate-y-1/2">
            <ConceptNode text="Trees & Heaps" />
          </div>
        </motion.div>
      </motion.div>

        <motion.div
        className="absolute w-[65%] h-[65%]"
        style={{ transform: 'translateY(13.3%)' }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-[calc(50%-1.5rem)] left-[-0.375rem] transform -translate-y-1/2">
            <ConceptNode text="LinkedList" />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute w-[50%] h-[50%]"
        style={{ transform: 'translateY(20%)' }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-[calc(50%-1.5rem)] left-[-0.375rem] transform -translate-y-1/2">
            <ConceptNode text="Arrays & Stacks" />
          </div>
        </motion.div>
      </motion.div>


      <div className="relative z-10 text-center">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
          CODE CORE
        </h3>
        <p className="text-sm text-base-content/70">Explore the Concepts</p>
      </div>
    </div>
  );
};

export default InteractiveArc;