
import User from "../../models/user.js";
import Problem from "../../models/problem.js";

async function pickRandomProblem(difficulty, commonTopics, userId, anotherUserId) {
  
  const user = await User.findById(userId).populate({path:"problemSolved"}); 
  const otherUser = await User.findById(anotherUserId).populate({path:"problemSolved"})

  console.log("user1", user)
  console.log("user2", otherUser)

  if (!user || !otherUser) return null;

  const userSolved = new Set(user.problemSolved.map(String));
  const otherSolved = new Set(otherUser.problemSolved.map(String));
  
  console.log("difficulty:", difficulty)
  console.log("tags:", commonTopics)
  
  const eligibleProblems = await Problem.find({
    difficulty,
    tags: { $in: commonTopics }
  });

  console.log("eligibleProblems", eligibleProblems)

  
  const filteredProblems = eligibleProblems.filter((problem) => {
    const problemId = problem._id.toString();
    const userHasSolved = userSolved.has(problemId);
    const otherHasSolved = otherSolved.has(problemId);

    return (userHasSolved && otherHasSolved) || (!userHasSolved && !otherHasSolved);
  });

  console.log("filteredProblems:", filteredProblems)

  if (filteredProblems.length === 0) {
    return null; 
  }

  return filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
}

export { pickRandomProblem };
