import Problem from "../../models/problem.js";
import User from "../../models/user.js";
import Submission from "../../models/submission.js";
import { getLanguageById, submitBatch, submitToken } from "../../utils/problemUtility.js";

const encodeBase64 = (str) => Buffer.from(str, "utf-8").toString("base64");

const decodeBase64 = (str) => (str ? Buffer.from(str, "base64").toString("utf-8") : "");

const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const todayDate = new Date().toISOString().split("T")[0];
  let lastDate = null;

  if (user.streak.lastActive) {
    lastDate = new Date(user.streak.lastActive).toISOString().split("T")[0];
  }

  if (!lastDate) {
    user.streak.current = 1;
    user.streak.max = 1;
  } else {
    const diffInDays = Math.floor(
      (new Date(todayDate) - new Date(lastDate)) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 1) {
      user.streak.current += 1;
    } else if (diffInDays > 1) {
      user.streak.current = 1;
    } else {
      return; 
    }

    user.streak.max = Math.max(user.streak.max, user.streak.current);
  }

  user.streak.lastActive = new Date(todayDate); // Save as Date object
  await user.save();
};

const battleSubmitCode = async (socket, answer, problem) => {
  try {
    const userId = socket.user._id;
    const { code, language } = answer;

  //  console.log("submittedCode", code)
  //  console.log("submittedLanguage", language)

    console.log("submissionProblem:", problem)

    if (!userId || !problem || !code || !language) {
    
    ///  console.log("Hello0")
      return socket.emit("error", { message: "Some Fields are missing" });
    }

  //  console.log("Hello1")

    const user = await User.findById(userId);
    if (!user) return socket.emit("error", { message: "User Not Found" });

  //  console.log("Hello2")

    const { hiddenVisibleTestCases, difficulty } = problem;

  //  console.log("Hello3")

    const submittedResult = await Submission.create({
      userId,
      problemId: problem._id,
      code,
      language,
      testCasesPassed: 0,
      status: "pending",
      testCasesTotal: hiddenVisibleTestCases.length,
    });

    const languageId = getLanguageById(language);

    const submissions = hiddenVisibleTestCases.map((tc) => ({
      source_code: encodeBase64(code),
      language_id: languageId,
      stdin: encodeBase64(tc.input),
      expected_output: encodeBase64(tc.output),
    }));

  //  console.log("Hello4");

    const submitResult = await submitBatch(submissions);
    const tokenStr = submitResult.map((el) => el.token).join(",");
    const testResult = await submitToken(tokenStr);

    let status = "accepted";
    let errorMessage = null;
    let testCasesPassed = 0;
    let runTime = 0;
    let memory = 0;

    let failedTestcase = {}

    let allAccepted = true;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;
        runTime += parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        status = test.status_id === 4 ? "wrong answer" : "error";
        failedTestcase={
            stdin:decodeBase64(test.stdin),
            expected_output:decodeBase64(test.expected_output),
            stdout:decodeBase64(test.stdout),
            errorMessage : test.status.description
        }
        errorMessage = test.status.description;
        break;
      }
    }

  //  console.log("Hello5")

    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runTime = runTime;
    submittedResult.memory = memory;
    await submittedResult.save();

    const isInclude = user.problemSolved.includes(problem._id);

    if (status === "accepted") {
      await updateStreak(userId);

      if (!isInclude) {
        user.problemSolved.push(problem._id);

        if (difficulty === "easy") user.codingScore += 2;
        else if (difficulty === "medium") user.codingScore += 4;
        else user.codingScore += 8;

        await user.save();
      }
    }

 //   console.log("Hello6")

     console.log("failedTestcase:", failedTestcase)

     const resObj = {
      accepted: status === "accepted",
      testCasesTotal: hiddenVisibleTestCases.length,
      testCasesPassed,
      runTime,
      memory,
      failedTestcase
    }

    console.log("resObj:", resObj)

    return resObj;
  } 
  catch (error) 
  {
    console.log("submitError:", error.message)
    socket.emit("submiterror", { message: error.message });
  }
};

const battleRunCode = async (socket, answer, problem) => {
  try {
    const userId = socket.user._id;
    const { code, language } = answer;

    // console.log("code:", code)
    // console.log("language:", language)

    if (!userId || !problem || !code || !language) {
      return socket.emit("error", { message: "Some Fields are missing" });
    }

    const dsaProblem = await Problem.findById(problem._id); // Fetch full problem
    if (!dsaProblem) return socket.emit("error", { message: "Problem Not found" });

    const { visibleTestCases } = dsaProblem;
    const languageId = getLanguageById(language);

    const submissions = visibleTestCases.map((tc) => ({
      source_code: encodeBase64(code),
      language_id: languageId,
      stdin: encodeBase64(tc.input),
      expected_output: encodeBase64(tc.output),
    }));

    const submitResult = await submitBatch(submissions);
    const tokenStr = submitResult.map((el) => el.token).join(",");
    const testResult = await submitToken(tokenStr);

    const normalResult = testResult.map((tc) => ({
      status_id: tc.status_id,
      description: tc.status.description,
      stdin: decodeBase64(tc.stdin),
      expected_output: decodeBase64(tc.expected_output),
      stdout: decodeBase64(tc.stdout),
    }));

    socket.emit("runresult", normalResult);
  } 
  catch (error) 
  {
    socket.emit("runerror", { message: error.message });
  }
};

export { battleSubmitCode, battleRunCode };
