import badges from "../badges.json"

const userBadge = (battlesWon) => {
  
  const currentBadge = badges.find(badge =>
    battlesWon >= badge.battlesWonStart && battlesWon <= badge.battlesWonEnd
   );

   return currentBadge
   ;

};

export default userBadge;