
import User from "../../models/user.js";
import matchmake from "./matchmake.js";
import { battleSubmitCode,battleRunCode } from "./battleSubmission.js";
import Problem from "../../models/problem.js";
import endBattle from "./battleEnd.js";
import Battle from "../../models/battle.js";

const onJoinBattle = async (socket, { difficulty, topic }, io,ongoingBattles,waitingPlayers) => {
  try {
    const entryFee = difficulty==='easy' ? 200 : difficulty==='medium' ? 1000 : 3000;
    const user = await User.findById(socket.user._id);

    if (!user) {
      return socket.emit('error', { message: 'User not found' });
    }
    
    console.log(user)
    console.log(user.coins)
    console.log(entryFee)

    if (user.coins < entryFee) {
      return socket.emit('error', { message: 'Not enough coins to join battle' });
    }

    //await User.findByIdAndUpdate(socket.user._id, { $inc: { coins: -entryFee } });

    matchmake(socket, difficulty, topic,ongoingBattles,waitingPlayers,entryFee);

    socket.emit('joinedBattle', { topic, difficulty });

  } catch (error) {
    console.error('Error in onJoinBattle:', error);
    socket.emit('error', { message: 'Internal server error' });
  }
};

const onSubmitAnswer = async (socket,{ battleId, answer },io,ongoingBattles) => {
  try {
    const battle = ongoingBattles.get(battleId);
    if (!battle) {
      return socket.emit('error', { message: 'Battle not found' });
    }
 //   console.log("battle:", battle)

    const result = await battleSubmitCode(socket,answer,battle.problem)

 //   console.log("results", result)

    socket.emit("submittedResult",result)

    console.log("result.accepted:", result)

    if(result.accepted)
    {
        battle.winnerTestResults = result;
        await endBattle(battleId,socket.id,io,ongoingBattles)
    }
 } 
  
  catch (err) 
  
  {
    console.error('Error in submitAnswer:', err.message);
    socket.emit('error', { message: 'Server error. Please try again.' });
  }
}

const onRunAnswer = async (socket,{ battleId, answer },io,ongoingBattles) => {
  try {
    const battle = ongoingBattles.get(battleId);
    if (!battle) {
      return socket.emit('error', { message: 'Battle not found' });
    }

    console.log("Running2")
      
    await battleRunCode(socket,answer,battle.problem)

    console.log("Running3")

    // if(result.accepted)
    // {
    //     battle.winnerTestResults = results;
    //     endBattle(battleId,socket.id,io)
    // }
 } 
  
  catch (err) 
  
  {
    console.error('Error in runAnswer:', err.message);
    socket.emit('error', { message: 'Server error. Please try again.' });
  }
}

const onDisconnect = async (socket,io,ongoingBattles,waitingPlayers)=> {

   // console.log(`User disconnected: ${socket.id}`);

  
    waitingPlayers.list = waitingPlayers.list.filter(p => p.socket.id !== socket.id);

    
    const activeBattleId = [...ongoingBattles.keys()].find(battleId => {
        const battle = ongoingBattles.get(battleId);
        return battle.player1.socketId === socket.id || battle.player2.socketId === socket.id;
    });

    if (activeBattleId) 
    {
    const battle = ongoingBattles.get(activeBattleId);
    const otherSocketId = battle.player1.socketId === socket.id ? battle.player2.socketId : battle.player1.socketId;
    io.to(otherSocketId).emit('opponentLeft', { message: 'Your opponent left, you win!' });

    
    await endBattle(activeBattleId, otherSocketId,io,ongoingBattles);
  }
}

const onTabChange = async (socket,io,{status},ongoingBattles) => {

     if (status === 'left') 
        {
   
    socket.tabTimeout = setTimeout(async () => {
      const activeBattleId = [...ongoingBattles.keys()].find(battleId => {
        const battle = ongoingBattles.get(battleId);
        return battle.player1.socketId === socket.id || battle.player2.socketId === socket.id;
    });
      if (activeBattleId) 
        {
        const battle = ongoingBattles.get(activeBattleId);
        const otherSocketId = battle.player1.socketId === socket.id ? battle.player2.socketId : battle.player1.socketId;
        io.to(otherSocketId).emit('opponentLeft', { message: 'Your opponent left, you win!' });
        await endBattle(activeBattleId, otherSocketId,io,ongoingBattles); 
      }
    }, 10000); 
  } 
  else if (status === 'returned') 
    {
    
    if (socket.tabTimeout) 
        {
      clearTimeout(socket.tabTimeout);
      socket.tabTimeout = null;
    }
  }

}

const onTimeOver = async (socket,io,{battleId},ongoingBattles) => {
    
  const battle = ongoingBattles.get(battleId);
  if (!battle) return;


  const rewardCoins = battle.difficulty==='easy' ? 400 : battle.difficulty==='medium' ? 2000 : 6000;;

  const { difficulty, commonTopics, problem } = battle;

  await User.findByIdAndUpdate(battle.player1.userId , {
    $inc: { battlesPlayed: 1}
  });
  await User.findByIdAndUpdate(battle.player2.userId , { $inc: { battlesPlayed : 1 } });


   await Battle.create({
    player1: battle.player1.userId,
    player2: battle.player2.userId,
    difficulty,
    topics: commonTopics,     
    problem: problem._id,     
    winner: null
  });

  const winnerTestResults = battle.winnerTestResults || null;

  io.to(battle.player1.socketId).emit('battleEnd', {
    winner: null,
    coins: rewardCoins,
    winnerTestResults,  
  });

  io.to(battle.player2.socketId).emit('battleEnd', {
    winner: null,
    coins: rewardCoins,
    winnerTestResults,
  });

  ongoingBattles.delete(battleId);

}


export {onJoinBattle,onSubmitAnswer,onRunAnswer,onDisconnect,onTabChange,onTimeOver};



