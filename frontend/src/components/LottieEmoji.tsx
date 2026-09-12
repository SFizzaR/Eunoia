import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { LottieEmojiProps } from "../types/emoji";
/**
 * Displays animated emoji using Lottie
 * Handles loading state and fallback for missing animations
 */
export function LottieEmoji({
  animationUrl,
  size = 40,
  title,
}: LottieEmojiProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const response = await fetch(animationUrl);
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error("Error loading Lottie animation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimation();
  }, [animationUrl]);

  if (loading) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: "#f0f0f0",
          borderRadius: "4px",
        }}
        aria-busy="true"
      />
    );
  }

  if (!animationData) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: "#ddd",
          textAlign: "center",
          lineHeight: `${size}px`,
        }}
        title={title}
      >
        ❌
      </div>
    );
  }

  return (
    <Lottie
      animationData={animationData}
      loop
      style={{ width: size, height: size }}
      title={title}
    />
  );
}
