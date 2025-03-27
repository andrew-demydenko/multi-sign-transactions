import { Router, Request, Response } from "express";
import { PrismaClient, Wallet } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get(
  "/user/:userAddress",
  async (req: Request<{ userAddress: string }>, res: Response) => {
    const { userAddress } = req.params;

    if (!userAddress) {
      return res.status(400).json({ error: "User address is required" });
    }

    try {
      const wallets = await prisma.wallet.findMany({
        where: {
          owners: {
            some: {
              userAddress,
            },
          },
        },
        include: {
          owners: {
            include: { user: true },
          },
        },
      });

      try {
        res.json(
          wallets.map((wallet) => ({
            ...wallet,
            owners: wallet.owners.map((owner) => owner.user),
          }))
        );
      } catch (error) {
        res
          .status(500)
          .json({ error: "Error while wallets getting", reason: error });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error while wallets getting", reason: error });
    }
  }
);

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
  const { owners, requiredSignatures, walletAddress } = req.body;

  if (!owners || owners.length === 0) {
    return res.status(400).json({ error: "users are required" });
  }

  if (!requiredSignatures) {
    return res.status(400).json({ error: "requiredSignatures is required" });
  }

  if (owners.length < requiredSignatures) {
    return res.status(400).json({
      error:
        "requiredSignatures must be less than or equal to the number of users",
    });
  }

  try {
    const newWallet = await prisma.wallet.create({
      data: {
        walletAddress,
        requiredSignatures,
        owners: {
          create: owners.map((userAddress: string) => ({
            user: {
              connectOrCreate: {
                where: { userAddress },
                create: { userAddress },
              },
            },
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
