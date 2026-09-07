"use client";
import { useLottie } from "lottie-react";
import { useEffect, useState } from "react";

interface MoodEmojiProps {
  animatedEmojiUrl: string;
  size?: number;
}

export function MoodEmoji({ animatedEmojiUrl, size = 50 }: MoodEmojiProps) {
  const [emoji, setEmoji] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(animatedEmojiUrl)
      .then((res) => res.json())
      .then((json) => {
        setEmoji(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading animation:", err);
        setIsLoading(false);
      });
  }, [animatedEmojiUrl]);

  const { View } = useLottie({
    animationData: emoji,
    loop: true,
  });

  if (isLoading) return <div style={{ width: size, height: size }} />;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {View}
    </div>
  );
}
