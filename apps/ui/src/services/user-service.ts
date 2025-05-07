import { IUser } from "@/types";

export const fetchUser = async (userAddress: string): Promise<IUser> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API}/users/${userAddress}`
    );
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  } catch (error) {
    throw new Error(`Could not fetch user. ${error}`);
  }
};

export const getOrCreateUser = async ({
  userAddress,
}: IUser): Promise<IUser> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userAddress }),
    });
    if (!response.ok) throw new Error("Failed to getOrCreateUser user");
    return response.json();
  } catch (error) {
    throw new Error(`Could not create or modify user. ${error}`);
  }
};

export const modifyUser = async ({
  userAddress,
  name,
}: IUser): Promise<IUser> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API}/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userAddress, name }),
    });
    if (!response.ok) throw new Error("Failed to modifyUser user");
    return response.json();
  } catch (error) {
    throw new Error(`Could not create or modify user. ${error}`);
  }
};
