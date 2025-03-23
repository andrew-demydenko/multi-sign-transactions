import { Router, Response, Request } from "express";
import prisma from "@/prisma";
import { Transaction } from "@prisma/client";

const router = Router();

router.get("/", async (_, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        wallet: true,
      },
    });
    res.json(transactions);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch transactions", reason: error });
  }
});

router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        wallet: true,
      },
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(transaction);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch transaction", reason: error });
  }
});

router.post("/", async (req: Request<Transaction>, res: Response) => {
  const { amount, recipient, walletAddress } = req.body;

  if (!amount || !recipient || !walletAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newTransaction = await prisma.transaction.create({
      data: {
        amount,
        recipient,
        walletAddress,
        timestamp: new Date(),
      },
    });
    res.status(201).json(newTransaction);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create transaction", reason: error });
  }
});

export default router;
