import { MoodEmoji } from "@/components/MoodEmoji";
import { EmotionCardProps } from "../types/dashboard";

export function EmotionCard({
  emotion,
  index,
  isLoaded,
  onViewEmotion,
}: EmotionCardProps) {
  const { emotionId, emotionName, animatedEmojiUrl, color, entryCount } =
    emotion;

  return (
    <div
      className={`transition-all duration-700 ${
        isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
      style={{
        transitionDelay: isLoaded ? `${index * 100}ms` : "0ms",
      }}
      onClick={() => onViewEmotion(emotionId)}
    >
      <div
        className="h-full rounded-2xl p-6 cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-lg"
        style={{
          backgroundColor: "#f9f9f9",
          border: `2px solid ${color}`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Emotion Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-2">
            <MoodEmoji animatedEmojiUrl={animatedEmojiUrl} size={60} />

            <h3
              className="text-xl font-bold"
              style={{
                fontFamily: "'Poppins', sans-serif",
                color: "#1a1a1a",
              }}
            >
              {emotionName}
            </h3>
          </div>

          <div
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: color,
              color: "#fff",
            }}
          >
            {entryCount}
          </div>
        </div>

        {/* FOLDER VISUALIZATION */}
        <div className="relative h-40 flex items-end justify-center mb-3">
          {/* Papers behind folder */}
          {entryCount > 0 && (
            <>
              {/* Paper 1 */}
              <div
                className="
                absolute
                bottom-4
                w-24
                h-30
                rounded-md
                bg-white
                border
                border-gray-200
                shadow-md
                transition-all
                duration-500
                ease-out
                rotate-[-8deg]
                group-hover:-translate-y-5
                group-hover:rotate-[-12deg]
              "
              >
                <div className="absolute top-5 left-3 right-3 space-y-1.5 opacity-40">
                  <div className="h-px bg-gray-300" />
                  <div className="h-px bg-gray-300" />
                  <div className="h-px bg-gray-300 w-3/4" />
                </div>
              </div>

              {/* Paper 2 */}
              {entryCount >= 2 && (
                <div
                  className="
                  absolute
                  bottom-4
                  w-24
                  h-30
                  rounded-md
                  bg-white
                  border
                  border-gray-200
                  shadow-md
                  transition-all
                  duration-500
                  ease-out
                  rotate-[7deg]
                  group-hover:-translate-y-6
                  group-hover:rotate-[11deg]
                "
                >
                  <div className="absolute top-5 left-3 right-3 space-y-1.5 opacity-40">
                    <div className="h-px bg-gray-300" />
                    <div className="h-px bg-gray-300" />
                    <div className="h-px bg-gray-300 w-2/3" />
                  </div>
                </div>
              )}

              {/* Paper 3 */}
              {entryCount >= 3 && (
                <div
                  className="
                  absolute
                  bottom-4
                  w-24
                  h-30
                  rounded-md
                  bg-white
                  border
                  border-gray-200
                  shadow-md
                  transition-all
                  duration-500
                  ease-out
                  rotate-[-2deg]
                  group-hover:-translate-y-7
                  group-hover:rotate-[-3deg]
                "
                >
                  <div className="absolute top-5 left-3 right-3 space-y-1.5 opacity-40">
                    <div className="h-px bg-gray-300" />
                    <div className="h-px bg-gray-300" />
                    <div className="h-px bg-gray-300 w-4/5" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Folder back / tab */}
          <div
            className="
            absolute
            bottom-4
            w-40
            h-24
            rounded-t-lg
          "
            style={{
              backgroundColor: color,
            }}
          >
            {/* Folder tab */}
            <div
              className="
              absolute
              -top-3
              left-0
              w-16
              h-5
              rounded-t-md
            "
              style={{
                backgroundColor: color,
              }}
            />
          </div>

          {/* Folder front */}
          <div
            className="
            absolute
            bottom-0
            w-44
            h-27
            rounded-lg
            transition-all
            duration-500
            ease-out
            group-hover:-translate-y-1
          "
            style={{
              backgroundColor: color,
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.10)",
            }}
          >
            {/* Subtle folder highlight */}
            <div
              className="
              absolute
              top-2.5
              left-3
              right-3
              h-px
              opacity-30
            "
              style={{
                backgroundColor: "#ffffff",
              }}
            />

            {/* Folder label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-base font-semibold text-white"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {emotionName}
              </span>

              <span
                className="text-[11px] mt-0.5 text-white opacity-75"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {entryCount} {entryCount === 1 ? "entry" : "entries"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors"
          style={{
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          View all →
        </p>
      </div>
    </div>
  );
}
