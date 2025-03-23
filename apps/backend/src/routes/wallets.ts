import { Router, Request, Response } from "express";
import { PrismaClient, Wallet } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (_, res: Response) => {
  try {
    const wallets = await prisma.wallet.findMany({
      include: {
        owners: true,
      },
    });
    res.json(wallets);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error while wallets getting", reason: error });
  }
});

router.get(
  "/:walletAddress",
  async (req: Request<{ walletAddress: string }>, res: Response) => {
    const { walletAddress } = req.params;

    try {
      const wallet = await prisma.wallet.findUnique({
        where: { walletAddress },
        include: {
          owners: true,
          transactions: true,
        },
      });

      if (!wallet) {
        return res.status(404).json({ error: "Wallet is not found" });
      }

      res.json(wallet);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error while wallet getting", reason: error });
    }
  }
);

router.post("/", async (req: Request<Wallet>, res: Response) => {
  const { users, minimumSignatures } = req.body;

  if (!users || users.length === 0) {
    return res.status(400).json({ error: "users are required" });
  }

  if (!minimumSignatures) {
    return res.status(400).json({ error: "minimumSignatures is required" });
  }

  if (users.length < minimumSignatures) {
    return res.status(400).json({
      error:
        "minimumSignatures must be less than or equal to the number of users",
    });
  }

  try {
    // Создание кошелька
    const newWallet = await prisma.wallet.create({
      data: {
        walletAddress: `${Date.now()}`,
        minimumSignatures,
        owners: {
          create: users.map((userAddress: string) => ({
            userAddress,
          })),
        },
      },
      include: {
        owners: true,
      },
    });

    res.status(201).json(newWallet);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error while wallet creation", reason: error });
  }
});

export default router;
