import { useState } from "react";
import { Scrim } from "@/components/Scrim";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";

interface RenameDialogProps {
  name: string;
  fileKey: string;
  isFolder: boolean;
  prefix: string;
  onCancel: () => void;
  onConfirm: (oldKey: string, newKey: string, isFolder: boolean) => void;
}

export function RenameDialog({ name, fileKey, isFolder, prefix, onCancel, onConfirm }: RenameDialogProps) {
  const [newName, setNewName] = useState(name);

  const handleSubmit = () => {
    if (!newName.trim() || newName === name) return;
    let newKey: string;
    if (isFolder) {
      const oldPrefix = fileKey.endsWith("/") ? fileKey : fileKey + "/";
      const parent = oldPrefix.slice(0, oldPrefix.lastIndexOf(name));
      newKey = parent + newName.trim();
    } else {
      const parts = fileKey.split("/");
      parts[parts.length - 1] = newName.trim();
      newKey = parts.join("/");
    }
    onConfirm(fileKey, newKey, isFolder);
  };

  return (
    <Scrim onClose={onCancel}>
      <div className="w-full max-w-md rounded-3xl bg-surface-container-low p-6 shadow-elev-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary-container text-secondary">
            <Icon name="drive_file_rename_outline" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Rename {isFolder ? "folder" : "file"}</h3>
            <p className="text-xs text-muted-foreground">Updates the S3 object key.</p>
          </div>
        </div>

        <TextField
          label="New name"
          icon="draft"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          supporting="Use letters, numbers, dashes and dots."
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <div className="mt-3 rounded-2xl bg-surface-container px-4 py-3 text-[11px] text-muted-foreground space-y-1">
          <div>
            <span className="text-foreground">Old:</span> {fileKey}
          </div>
          <div>
            <span className="text-foreground">New:</span>{" "}
            <span className="text-primary font-semibold">{newName}</span>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="text" onClick={onCancel}>Cancel</Button>
          <Button icon="check" onClick={handleSubmit} disabled={!newName.trim() || newName === name}>
            Rename
          </Button>
        </div>
      </div>
    </Scrim>
  );
}
