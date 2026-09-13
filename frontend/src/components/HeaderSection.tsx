import { HeaderSectionProps } from "@/types/dashboard";

export function HeaderSection({
  headerImage,
  currentDate,
  isLoaded,
  onHeaderImageUpload,
  onHeaderImageDelete,
  uploading = false,
  deleting = false,
}: HeaderSectionProps) {
  const isImageLoading = uploading || deleting;

  return (
    <div
      className={`relative z-0 w-full h-64 md:h-80 overflow-hidden transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: headerImage
          ? `url(${headerImage})`
          : "linear-gradient(135deg, #f782a9 0%, #F9C5C7 100%)",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)",
        }}
      />

      {/* Header Image Upload */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <label htmlFor="header-upload" className="cursor-pointer">
          <div
            className="p-2 rounded-full transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.8)",
              opacity: isImageLoading ? 0.6 : 1,
            }}
            title="Change cover photo"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>

          <input
            id="header-upload"
            type="file"
            accept="image/*"
            onChange={onHeaderImageUpload}
            className="hidden"
            disabled={isImageLoading}
          />
        </label>

        {headerImage && (
          <button
            type="button"
            onClick={onHeaderImageDelete}
            className="p-2 rounded-full transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.5)",
              opacity: isImageLoading ? 0.6 : 1,
            }}
            title="Remove cover photo"
            disabled={isImageLoading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        )}
      </div>

      {/* Current Date in Header */}
      <div
        className="absolute bottom-4 left-4 text-white text-sm md:text-base font-medium"
        style={{
          textShadow: "2px 2px 6px rgba(0, 0, 0, 0.36)",
        }}
      >
        {currentDate}
      </div>
    </div>
  );
}
