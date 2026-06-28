import { useState, useRef } from "react";
import { toast } from "sonner";
import { Scrim } from "@/components/Scrim";
import { Icon } from "@/components/Icon";
import { Button, IconButton } from "@/components/Button";
import { api } from "@/lib/api";

interface UploadSheetProps {
  prefix: string;
  onClose: () => void;
  onUpload: (files: FileList | File[]) => void;
}

export function UploadSheet({ prefix, onClose, onUpload }: UploadSheetProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    abortRef.current = new AbortController();
    try {
      const formData = new FormData();
      formData.append("prefix", prefix);
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files[]", selectedFiles[i]);
      }
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: abortRef.current.signal,
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`Uploaded ${data.uploaded?.length || selectedFiles.length} file(s)`);
        onUpload(selectedFiles);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        toast("Upload cancelled");
      } else {
        toast.error(err.message);
      }
    } finally {
      setUploading(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    if (uploading && abortRef.current) {
      abortRef.current.abort();
    } else {
      onClose();
    }
  };

  return (
    <Scrim onClose={!uploading ? onClose : undefined}>
      <div className="w-full max-w-2xl rounded-3xl bg-surface-container-low p-5 md:p-6 shadow-elev-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-container text-primary">
              <Icon name="cloud_upload" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upload files</h3>
              <p className="text-[11px] text-muted-foreground">
                to /{prefix || "root"}
              </p>
            </div>
          </div>
          <IconButton icon="close" onClick={handleCancel} />
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            uploading
              ? "border-outline-variant opacity-50 pointer-events-none"
              : dragActive
                ? "border-primary bg-primary-container/30"
                : "border-outline-variant hover:border-primary hover:bg-surface-container"
          }`}
        >
          <Icon
            name="cloud_upload"
            size={48}
            className={dragActive ? "text-primary" : "text-muted-foreground"}
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Drag & drop files here, or click to browse
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Any file type, up to 5 GB per file
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Selected files list */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2 max-h-40 overflow-auto rounded-2xl bg-surface-container p-3">
            {selectedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <Icon name="draft" size={18} className="text-on-surface-variant" />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(f.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="mt-4 rounded-2xl bg-surface-container p-3">
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm font-medium">Uploading {selectedFiles.length} file(s)...</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
              <div className="h-full w-2/3 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between">
          <Button
            variant="tonal"
            icon="folder"
            onClick={() => folderInputRef.current?.click()}
            disabled={uploading}
          >
            Upload folder
          </Button>
          <div className="flex gap-2">
            <Button variant="text" onClick={handleCancel}>
              {uploading ? "Cancel upload" : "Close"}
            </Button>
            {!uploading && (
              <Button
                icon="upload"
                onClick={handleUploadClick}
                disabled={selectedFiles.length === 0}
              >
                Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Scrim>
  );
}
