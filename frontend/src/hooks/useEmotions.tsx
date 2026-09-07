import { logout } from "../../lib/auth";

export const fetchEmotions = async () => {
  try {
    const response = await fetch("http://localhost:3000/emotions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch emotions");
    }

    if (response.status === 401) {
      logout();
      return;
    }
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
