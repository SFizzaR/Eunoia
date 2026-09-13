import { COLORS } from "../constants/dashboard";
import { QuoteSectionProps } from "@/types/quotes";

export function QuoteSection({ quote, author, isLoaded }: QuoteSectionProps) {
  return (
    <div
      className={`mb-12 p-8 rounded-2xl transition-all duration-700 ${
        isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
      style={{
        backgroundColor: COLORS.BG_WHITE,
        border: `2px solid ${COLORS.SECONDARY}`,
        boxShadow: `0 8px 32px ${COLORS.SHADOW_COLOR}`,
      }}
    >
      <p
        className="text-xl md:text-2xl text-center leading-relaxed italic"
        style={{
          fontFamily: "'Playfair Display', serif",
          color: COLORS.TEXT_PRIMARY,
        }}
      >
        "{quote}"
      </p>
      <p
        className="text-center text-sm mt-4"
        style={{
          color: COLORS.PRIMARY,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        — {author}
      </p>
    </div>
  );
}
