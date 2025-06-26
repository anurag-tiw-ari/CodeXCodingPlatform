import badges from "../badges.json"

const BattleBadge = ({ battlesWon }) => {
  
  const currentBadge = badges.find(badge =>
    battlesWon >= badge.battlesWonStart && battlesWon <= badge.battlesWonEnd
  );

  return (
    <div className="flex items-center gap-3 bg-gray-800/80 px-4 py-2 rounded-full border border-purple-400/30">
      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-xl">
          {currentBadge?.emoji}
        </span>
      </div>
      <div>
        <p className="text-xs text-gray-400">BATTLE RANK</p>
        <span className="text-xl font-bold text-purple-400">
          {currentBadge?.name}
        </span>
      </div>
    </div>
  );
};

export default BattleBadge;
