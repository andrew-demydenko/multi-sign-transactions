import express from "express";
import cors from "cors";
import "dotenv/config";
import usersRouter from "@/routes/users";
import transactionsRouter from "@/routes/transactions";
import walletsRouter from "@/routes/wallets";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/wallets", walletsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
