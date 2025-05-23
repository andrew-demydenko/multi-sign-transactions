import { Router, Request, Response } from "express";
import prisma from "@/prisma";
import { User } from "@prisma/client";

const router = Router();

router.get("/", async (_, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving users", reason: error });
  }
});

router.get(
  "/:userAddress",
  async (req: Request<{ userAddress: string }>, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { userAddress: req.params.userAddress },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving user", reason: error });
    }
  }
);

router.post("/", async (req: Request<User>, res: Response) => {
  const { userAddress } = req.body;

  if (!userAddress) {
    return res.status(400).json({ error: "userAddress is required" });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { userAddress },
    });

    if (currentUser) {
      res.status(201).json(currentUser);
    } else {
      const user = await prisma.user.create({
        data: { userAddress },
      });

      res.status(201).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: "Error creating user", reason: error });
  }
});

router.put("/", async (req: Request<User>, res: Response) => {
  const { userAddress, name } = req.body;

  if (!userAddress) {
    return res.status(400).json({ error: "userAddress is required" });
  }

  try {
    const user = await prisma.user.update({
      where: { userAddress },
      data: { userAddress, name },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error creating user", reason: error });
  }
});

export default router;
