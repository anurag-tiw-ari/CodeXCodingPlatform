
const onMessage = async (socket,io,{message,battleId},ongoingBattles) => {

   const battle = ongoingBattles.get(battleId);

   if (!battle) return;

   const otherPlayerSocketId = battle.player1.socketId === socket.id ? battle.player2.socketId : battle.player1.socketId

   io.to(otherPlayerSocketId).emit("newMessage",message)

}

export default onMessage;