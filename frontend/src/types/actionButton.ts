export interface ActionButtonsProps {
  saving: boolean;
  reflectionLoading: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onReflect: () => void;
  onDelete: () => void;
  hasContent: boolean;
  hasEntry: boolean;
  isLocked: boolean;
}
