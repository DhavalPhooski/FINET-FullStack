import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "server ok" }));

app.listen(3001, () => console.log("Server running on port 3001"));
