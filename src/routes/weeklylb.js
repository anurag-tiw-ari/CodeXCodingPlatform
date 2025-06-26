

import express from "express";
import WeeklyLeaderboard from "../models/weeklyLeaderboard.js";
import userMidddleware from "../middleware/userMiddleware.js";

const leaderBoardRouter = express.Router();

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); 

  const diff = d.getUTCDate() - (day === 0 ? 6 : day - 1); 
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

leaderBoardRouter.get('/battles/weeklyLB',userMidddleware,async (req,res)=>{

  const weekStart = getStartOfWeek(new Date());

  try{

  const topUsers = await WeeklyLeaderboard.find({ weekStart })
    .sort({ weeklyCoinsEarned: -1 })
    .limit(10)
    .populate('userId', 'firstName profilePic battlesWon'); 

  res.status(200).send(topUsers);    
  }
  catch(err)
  {
      res.status(500).send("Can Not Load Weekly LedaerBoard")
  }

})

export default leaderBoardRouter;