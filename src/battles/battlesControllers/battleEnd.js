import Battle from "../../models/battle.js";
import updateWeeklyLeaderboard from "../../controllers/updateWeeklyLeaderboard.js";
import User from "../../models/user.js";

async function endBattle(battleId, winnerSocketId,io,ongoingBattles) {
  const battle = ongoingBattles.get(battleId);
  if (!battle) return;

  console.log("battle(End):", battle)
    const winnerUserId = winnerSocketId === battle.player1.socketId 
  ? battle.player1.userId 
  : battle.player2.userId;

const loserUserId = winnerUserId === battle.player1.userId 
  ? battle.player2.userId 
  : battle.player1.userId;

  const rewardCoins = battle.difficulty==='easy' ? 400 : battle.difficulty==='medium' ? 2000 : 6000;;

  const { difficulty, commonTopics, problem } = battle;

  await User.findByIdAndUpdate(winnerUserId, {
    $inc: { battlesPlayed: 1, battlesWon: 1, coins: rewardCoins }
  });
  await User.findByIdAndUpdate(loserUserId, { $inc: { battlesPlayed : 1 } });

  await updateWeeklyLeaderboard(winnerUserId, rewardCoins);

   await Battle.create({
    player1: battle.player1.userId,
    player2: battle.player2.userId,
    difficulty,
    topics: commonTopics,     
    problem: problem._id,     
    winner: winnerUserId,
  });

  const winnerTestResults = battle.winnerTestResults || null;

  io.to(battle.player1.socketId).emit('battleEnd', {
    winner: winnerUserId,
    coins: rewardCoins,
    winnerTestResults,  
  });

  io.to(battle.player2.socketId).emit('battleEnd', {
    winner: winnerUserId,
    coins: rewardCoins,
    winnerTestResults,
  });

  ongoingBattles.delete(battleId);
}


export default endBattle;