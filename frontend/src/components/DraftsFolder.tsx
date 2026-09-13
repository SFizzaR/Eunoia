import { Pencil } from "lucide-react";
import { COLORS } from "../constants/dashboard";
import { DraftsFolderProps } from "@/types/dashboard";

export function DraftsFolder({ draftCount, onViewDrafts }: DraftsFolderProps) {
  if (draftCount === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2
        className="text-2xl font-bold mb-6"
        style={{
          fontFamily: "'Poppins', sans-serif",
          color: COLORS.TEXT_PRIMARY,
        }}
      >
        📝 Drafts ({draftCount})
      </h2>
      <div
        className="p-6 rounded-2xl cursor-pointer transition-all hover:shadow-lg"
        style={{
          backgroundColor: "#fff9f0",
          border: "2px dashed #ddd",
        }}
        onClick={onViewDrafts}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: COLORS.TEXT_PRIMARY }}
            >
              Your Drafts
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Continue editing your drafts
            </p>
          </div>
          <Pencil size={24} color="#A9A9A9" />
        </div>
      </div>
    </div>
  );
}
