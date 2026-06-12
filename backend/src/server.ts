import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    error: "not_found",
    path: req.originalUrl,
  });
});

// 503 Service Unavailable
app.get("/maintenance", (req, res) => {
  res.setHeader("Retry-After", "5"); 
  res.status(503).json({
    error: "service_unavailable",
    retry_after: 5,
  });
});


const PORT = process.env.PORT || 5010;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
