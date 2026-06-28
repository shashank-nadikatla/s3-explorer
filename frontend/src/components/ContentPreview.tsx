import { Icon } from "./Icon";
import { Button, IconButton } from "./Button";
import { Chip } from "./Chip";
import { getFileType, typeMeta } from "@/lib/fileTypes";

interface ContentPreviewProps {
  fileKey: string;
  fileName: string;
  content: string | null;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
}

export function ContentPreview({
  fileKey,
  fileName,
  content,
  onClose,
  onEdit,
  onDownload,
}: ContentPreviewProps) {
  const fileType = getFileType(fileName);
  const meta = typeMeta[fileType];
  const isBinary = content === "__BINARY__";
  const lines = content && !isBinary ? content.split("\n") : [];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-surface-container-low px-4 py-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${meta.tone}`}>
          <Icon name={meta.icon} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{fileName}</div>
          <div className="text-[11px] text-muted-foreground truncate">/{fileKey}</div>
        </div>
        <IconButton icon="download" onClick={onDownload} />
        <Button variant="tonal" icon="edit" onClick={onEdit}>
          Edit
        </Button>
        <IconButton icon="close" onClick={onClose} />
      </div>

      {/* Content */}
      {content === null ? (
        <div className="flex-1 grid place-items-center">
          <div className="text-center text-muted-foreground">
            <Icon name="hourglass_empty" size={32} className="opacity-50 mb-2" />
            <p className="text-sm">Loading preview…</p>
          </div>
        </div>
      ) : isBinary ? (
        <div className="flex-1 grid place-items-center p-8">
          <div className="text-center">
            <Icon name="block" size={64} className="text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold">Binary file</h3>
            <p className="text-sm text-muted-foreground mt-1">Preview not available for this file type.</p>
            <Button icon="download" onClick={onDownload} className="mt-4">
              Download file
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-surface-container-lowest font-mono text-[12px] leading-[1.7]">
          <div className="grid grid-cols-[44px_1fr] min-h-full">
            <div className="border-r bg-surface-container-low py-4 text-right text-muted-foreground select-none">
              {lines.map((_, i) => (
                <div key={i} className="pr-2">
                  {i + 1}
                </div>
              ))}
            </div>
            <pre className="py-4 pl-4 text-foreground whitespace-pre-wrap break-all">
              {content}
            </pre>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-surface-container-low px-5 py-2 text-[11px] text-muted-foreground">
        <span>{meta.label} · UTF-8</span>
        <Chip tone="secondary" icon="check_circle">
          Synced
        </Chip>
      </div>
    </div>
  );
}
