import { useState } from "react";
import { Scrim } from "@/components/Scrim";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";

interface NewFolderDialogProps {
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export function NewFolderDialog({ onCancel, onConfirm }: NewFolderDialogProps) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    setCreating(true);
    onConfirm(name.trim());
  };

  return (
    <Scrim onClose={!creating ? onCancel : undefined}>
      <div className="w-full max-w-md rounded-3xl bg-surface-container-low p-6 shadow-elev-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary-container text-secondary">
            <Icon name="create_new_folder" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">New folder</h3>
            <p className="text-xs text-muted-foreground">Create a new folder in this location.</p>
          </div>
        </div>

        <TextField
          label="Folder name"
          icon="folder"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my-new-folder"
          autoFocus
          disabled={creating}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="text" onClick={onCancel} disabled={creating}>Cancel</Button>
          <Button icon="create_new_folder" onClick={handleSubmit} disabled={!name.trim()} loading={creating}>
            Create
          </Button>
        </div>
      </div>
    </Scrim>
  );
}
