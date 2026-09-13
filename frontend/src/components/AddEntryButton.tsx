import { AddEntryButtonProps } from "@/types/dashboard";

export function AddEntryButton({ onAddEntry }: AddEntryButtonProps) {
  return (
    <button
      onClick={onAddEntry}
      className="relative group"
      style={{
        width: "60px",
        height: "60px",
      }}
      title="Add new entry"
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: "linear-gradient(135deg, #F9C5C7 0%, #f782a9 100%)",
          boxShadow: "0 4px 20px rgba(247, 130, 169, 0.35)",
        }}
      >
        <span className="text-3xl font-bold text-white">+</span>
      </div>

      {/* Tooltip */}
      <div
        className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg whitespace-nowrap text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          fontSize: "12px",
        }}
      >
        Add Entry
      </div>
    </button>
  );
}
