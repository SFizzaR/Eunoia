"use client";

import { useState, useRef } from "react";
import { X, Download } from "lucide-react";
import styles from "./Fileviewer.module.css";
import { FileViewerProps } from "@/types/fileViewer";

export function FileViewer({ file, onClose }: FileViewerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isImage = file.fileType.startsWith("image/");
  const isAudio = file.fileType.startsWith("audio/");
  const isPDF = file.fileType === "application/pdf";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.download = file.fileName;
    link.click();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{file.fileName}</h2>
          <div className={styles.actions}>
            <button
              className={styles.downloadBtn}
              onClick={handleDownload}
              title="Download"
            >
              <Download size={20} />
            </button>
            <button className={styles.closeBtn} onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {isImage && (
            <img
              src={file.fileUrl}
              alt={file.fileName}
              className={styles.image}
              onLoad={() => setIsLoading(false)}
            />
          )}

          {isAudio && (
            <div className={styles.audioContainer}>
              <div className={styles.audioIcon}>🎵</div>
              <audio
                ref={audioRef}
                controls
                className={styles.audioPlayer}
                onLoadedMetadata={() => setIsLoading(false)}
              >
                <source src={file.fileUrl} type={file.fileType} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {isPDF && (
            <iframe
              src={file.fileUrl}
              className={styles.pdfViewer}
              onLoad={() => setIsLoading(false)}
              title="PDF Viewer"
            />
          )}

          {!isImage && !isAudio && !isPDF && (
            <div className={styles.unsupported}>
              <p>Preview not available for this file type</p>
              <p className={styles.fileType}>{file.fileType}</p>
              <button
                className={styles.downloadFallback}
                onClick={handleDownload}
              >
                <Download size={20} />
                Download to view
              </button>
            </div>
          )}

          {isLoading && (isImage || isAudio || isPDF) && (
            <div className={styles.loadingSpinner}>Loading...</div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.fileInfo}>
            {file.fileType} • {(file.fileSize / 1024).toFixed(2)} KB
          </span>
        </div>
      </div>
    </div>
  );
}
