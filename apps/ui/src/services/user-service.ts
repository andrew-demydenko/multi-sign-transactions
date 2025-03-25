export interface IUser {
  userAddress: string;
  name?: string;
}

export const fetchUser = async (userAddress: string): Promise<IUser> => {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/api/users/${userAddress}`
  );
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
};

export const createOrModifyUser = async ({
  userAddress,
  name,
}: IUser): Promise<IUser> => {
  const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userAddress, name }),
  });
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
};
