
import { motion } from "framer-motion";
import { Link } from "react-router";

function BattlePromoSection() {
  return (
    <div className="relative py-20 overflow-hidden bg-gradient-to-b from-gray-900 to-base-200" id="battle">
      {/* Glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>
      </div>
      
      {/* Animated floating code brackets */}
      <motion.div 
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 8,
          ease: "easeInOut"
        }}
        className="absolute top-10 left-10 text-6xl opacity-20 text-purple-300"
      >
        {"</>"}
      </motion.div>
      <motion.div 
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -5, 5, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 7,
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute bottom-10 right-10 text-6xl opacity-20 text-cyan-300"
      >
        {"{}"}
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase mb-6"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Ready for Battle?
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-12"
          >
            Test your skills in real-time coding duels against other developers. 
            Solve problems faster than your opponent to win coins and climb the ranks!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <Link 
              to="/battlehomepage" 
              className="relative px-8 py-4 text-lg font-bold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-purple-500/30 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                ENTER THE ARENA
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Link>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-cyan-400 flex flex-col items-center mt-12"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
              <div className="h-8 w-px bg-gradient-to-b from-cyan-500 to-transparent"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Battle features grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: "⚔️",
              title: "Real-time Duels",
              description: "Head-to-head coding battles against live opponents"
            },
            {
              icon: "🏆",
              title: "Win Prizes",
              description: "Earn battle coins and unlock achievements"
            },
            {
              icon: "⏱️",
              title: "Timed Challenges",
              description: "Race against the clock to solve problems first"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -5 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-cyan-400/30 transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default BattlePromoSection;