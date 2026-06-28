import { useState } from "react";
import { Scrim } from "@/components/Scrim";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";

interface DeleteDialogProps {
  keys: string[];
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ keys, onCancel, onConfirm }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    onConfirm();
  };

  return (
    <Scrim onClose={!deleting ? onCancel : undefined}>
      <div className="w-full max-w-lg rounded-3xl bg-surface-container-low p-6 shadow-elev-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-error-container text-error">
            <Icon name="delete_forever" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Delete {keys.length} item{keys.length > 1 ? "s" : ""}?
            </h3>
            <p className="text-xs text-muted-foreground">This action is permanent and cannot be undone.</p>
          </div>
        </div>

        <div className="space-y-1.5 rounded-2xl bg-surface-container px-4 py-3 text-sm max-h-48 overflow-auto">
          {keys.map((key) => {
            const name = key.split("/").pop() || key;
            return (
              <div key={key} className="flex items-center gap-3">
                <Icon name="draft" size={18} className="text-on-surface-variant" />
                <span className="flex-1 truncate">{name}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="text" onClick={onCancel} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" icon={deleting ? undefined : "delete"} onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete permanently"
            )}
          </Button>
        </div>
      </div>
    </Scrim>
  );
}
