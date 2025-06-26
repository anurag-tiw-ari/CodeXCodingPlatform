import {onJoinBattle,onSubmitAnswer,onRunAnswer,onDisconnect,onTabChange,onTimeOver} from "./battlesControllers/battlelogic.js";
import onMessage from "./battlesControllers/battleChat.js";
let waitingPlayers = {list:[]};
let ongoingBattles = new Map();

function socketConnection(io)
{
    io.on('connection',(socket)=>{
        //socket.emit("message","connected")

     socket.on('joinBattle', (data) => onJoinBattle(socket, data, io,ongoingBattles,waitingPlayers));
     socket.on('submitAnswer', (data) => onSubmitAnswer(socket, data, io,ongoingBattles));
     socket.on('runAnswer', (data) => onRunAnswer(socket, data, io,ongoingBattles));
     socket.on('disconnect', () => onDisconnect(socket,io,ongoingBattles,waitingPlayers));
     socket.on('tabChange', (data) => onTabChange(socket,io,data,ongoingBattles));
     socket.on('timeOver', (data) => onTimeOver(socket,io,data,ongoingBattles));
     socket.on('message', (data) => onMessage(socket,io,data,ongoingBattles));
    })
}

export default socketConnection;