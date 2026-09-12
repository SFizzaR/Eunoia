export interface FileViewerProps {
  file: {
    id: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  };
  onClose: () => void;
}
