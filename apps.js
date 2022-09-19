import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/database.js";
import userRoute from "./routes/Users.js";

dotenv.config();

const app = express();
const port = process.env.LOCAL_PORT || 5000;

db.authenticate()
  .then(() => console.log("◉ your database running successfully."))
  .catch((error) => console.log(error.message));

app.use(cors({ credentials: true, origin: "*" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());

app.use("/api/v1/", userRoute);

app.listen(port, () => console.log(`◉ server running at port ${port}`));
