import { pickRandomProblem } from "./elgibleProblems.js";
import User from "../../models/user.js";

async function matchmake(socket, difficulty, topics, ongoingBattles, waitingPlayers, entryFee) {
   
    console.log("waitingList1:", waitingPlayers.list);

    let existing = null;
    let problem = null;
    let commonTopics = [];

    // Loop through all waiting players instead of using .find()
    for (const p of waitingPlayers.list) {
        if (
            p.difficulty === difficulty &&
            p.socket?.user?._id?.toString() !== socket.user?._id?.toString()
        ) {
            const overlap = p.topics.filter((t) => topics.includes(t));
            if (overlap.length === 0) continue;

            const candidateProblem = await pickRandomProblem(
                difficulty,
                overlap,
                p.socket.user._id,
                socket.user._id
            );

            if (candidateProblem) {
                existing = p;
                problem = candidateProblem;
                commonTopics = overlap;
                break; // stop after finding a valid match
            }
        }
    }

    if (existing) {
        const battleId = `battle-${Date.now()}`;

        console.log("problem:", problem);

        ongoingBattles.set(battleId, {
            player1: {
                userId: existing.socket.user._id,
                socketId: existing.socket.id,
            },
            player2: {
                userId: socket.user._id,
                socketId: socket.id,
            },
            difficulty,
            commonTopics,
            problem,
            createdAt: new Date(),
        });

        const user1 = await User.findById(socket.user._id);
        const user2 = await User.findById(existing.socket.user._id);

        socket.emit('battleStart', {
            battleId,
            problem,
            commonTopics,
            difficulty,
            user1,
            user2
        });

        existing.socket.emit('battleStart', {
            battleId,
            problem,
            commonTopics,
            difficulty,
            user1,
            user2
        });

        await User.findByIdAndUpdate(socket.user._id, { $inc: { coins: -entryFee } });
        await User.findByIdAndUpdate(existing.socket.user._id, { $inc: { coins: -entryFee } });

        waitingPlayers.list = waitingPlayers.list.filter(
            (p) => p.socket.id !== existing.socket.id
        );

        console.log("waitingList2:", waitingPlayers.list);
    } else {
        // No valid match found, add this player to the waiting list
        waitingPlayers.list.push({ socket, difficulty, topics, joinTime: Date.now() });

        console.log("waitingList3:", waitingPlayers.list);

        setTimeout(() => {
            const stillWaiting = waitingPlayers.list.find((p) => p.socket.id === socket.id);
            if (stillWaiting) {
                waitingPlayers.list = waitingPlayers.list.filter(
                    (p) => p.socket.id !== socket.id
                );

                console.log("waitingList4:", waitingPlayers.list);

                socket.emit('noPlayersFound', {
                    message: 'No opponent found. Please try again or change your criteria.',
                });
            }
        }, 20000);
    }
}

export default matchmake;

