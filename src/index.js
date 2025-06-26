import express from "express";
import dotenv from "dotenv";
import http from "http";             
import { Server } from "socket.io";  
dotenv.config();
import main from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/userAuth.js";
import redisClient from "./config/redis.js";
import problemRouter from "./routes/problemCreator.js";
import submitRouter from "./routes/submit.js";
import cors from "cors";
import aiRouter from "./routes/aiChatting.js";
import videoRouter from "./routes/videoCreator.js";
import contentRouter from "./routes/contentEditor.js";
import imageRouter from "./routes/contentImage.js";
import contentCommentRouter from "./routes/contentcomment.js";
import './potdCron.js';
import socketMiddleware from "./middleware/socketMiddleware.js";
import socketConnection from "./battles/socketConnection.js";
import leaderBoardRouter from "./routes/weeklylb.js";
import watchadsRouter from "./routes/watchads.js";
import path from "path"


const __dirname = path.resolve()

const app = express();

app.use(
  cors({
    origin: "https://codexcodingplatform.onrender.com",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);
app.use("/content", contentRouter);
app.use("/image", imageRouter);
app.use("/contentcomment", contentCommentRouter);
app.use("/leaderboard",leaderBoardRouter)
app.use("/watch",watchadsRouter)

const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "https://codexcodingplatform.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(socketMiddleware)

socketConnection(io)
//registerBattleHandlers(io);

app.use(express.static(path.join(__dirname,"/frontend","dist")))

app.get("/*splat",(_,res)=>{
     res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
})

const InitializeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("Connected to DB");

    server.listen(process.env.PORT, () => {
      console.log(`Server is listening at port ${process.env.PORT}`);
    });
  } 
  catch (err) 
  {
    console.log("Error Not Connected to DB " + err);
  }
};

InitializeConnection();
