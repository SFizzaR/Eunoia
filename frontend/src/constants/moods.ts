import { MoodData } from "@/types/moods";

export const moods: MoodData[] = [
  {
    mood: "Happy",
    color: "#fff8d1ff",
    filepath: "/happy.json",
    description: "You're glowing today! Keep spreading the positivity.",
  },
  {
    mood: "Sad",
    color: "#d3ddfc",
    filepath: "/sad.json",
    description: "It's okay to feel low. We'll help you find comfort.",
  },
  {
    mood: "Angry",
    color: "#fad8d8ff",
    filepath: "/angry.json",
    description: "Take a deep breath. Let's find a way to release the tension.",
  },
  {
    mood: "Stressed",
    color: "#f6d4faff",
    filepath: "/stress.json",
    description: "Pause, slow down, and give yourself a moment to recharge.",
  },
];
