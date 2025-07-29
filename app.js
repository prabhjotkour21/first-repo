import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { AuthRouter } from "./routes/authRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { eventRouter } from "./routes/eventRoutes.js";
import { errorHandler } from "./middleware/globalErrorHandler.js";
import { teamLeadRoutes } from "./routes/teamLeadRoutes.js";
import { stageRouter } from "./routes/stageRoutes.js";
import { pipelineRouter } from "./routes/pipelineRoutes.js";
import {router} from "./routes/tokenRouter.js"
import { dealRouter } from "./routes/dealRoutes.js";
import { inviteRouter } from "./routes/inviteRoutes.js";


import { calendarRouter } from "./routes/calendarRoutes.js";
import { startEmailSyncCron ,syncGoogleCalendarEvents } from "./cron/syncfunction.js";

import { gmailRouter } from "./routes/gmailRoutes.js"

import {fastAPIRouter }from "./routes/finalizeRoutes.js";

import {clientRouter} from "./routes/clientCompanyRoutes.js"

import {callHelloAPI} from "./utils/check.js"
const app = express();
app.use(cors());

const PORT = process.env.PORT;

app.use(express.json());
app.use("/api", AuthRouter );
app.use("/api/admin", adminRouter);

app.use("/api/event", eventRouter);

app.use("/api/teamLead", teamLeadRoutes);

app.use("/api/stage", stageRouter);

app.use("/api/pipeline", pipelineRouter);

app.use("/api/deal", dealRouter);
app.use("/api/invite", inviteRouter);


app.use("/api/calendar", calendarRouter);

app.use("/api/gmail-url",gmailRouter)
app.use("/api/gmail",router)

app.use("/api/fastApi", fastAPIRouter);

app.use("/api/client-companies",clientRouter)

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Server is running....",
  });
});


app.get("/test-hello", async (req, res) => {
  try {
    const result = await callHelloAPI();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to call Python /hello API" });
  }
});



app.use(errorHandler)
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port http://localhost:${PORT}`);
});



syncGoogleCalendarEvents();
startEmailSyncCron();


