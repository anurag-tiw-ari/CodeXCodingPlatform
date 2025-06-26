import WeeklyLeaderboard from "../models/weeklyLeaderboard.js";


function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); 

  const diff = d.getUTCDate() - (day === 0 ? 6 : day - 1); 
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}



const updateWeeklyLeaderboard = async (userId, rewardCoins) => {
  const now = new Date();
  const currentWeekStart = getStartOfWeek(now); 

  const existing = await WeeklyLeaderboard.find({ userId }).sort({createdAt:-1});

  console.log("existing:", existing)

  if (
    existing.length>0 &&
    (existing[0].weekStart?.getTime() === currentWeekStart.getTime() || !existing[0].weekStart)
  ) 
  {
   // console.log("Hello 1")
    existing[0].weekStart = currentWeekStart;
    existing[0].weeklyCoinsEarned += rewardCoins;
    await existing[0].save();
  } else {
     
   //  console.log("Hello 2")
    await WeeklyLeaderboard.create({
      userId,
      weeklyCoinsEarned: rewardCoins,
      weekStart: currentWeekStart
    });
  }
};

export default updateWeeklyLeaderboard

