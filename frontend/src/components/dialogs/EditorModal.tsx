import { useState } from "react";
import { Scrim } from "@/components/Scrim";
import { Icon } from "@/components/Icon";
import { Button, IconButton } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { TextField } from "@/components/TextField";

interface EditorModalProps {
  fileKey: string;
  fileName: string;
  isNew: boolean;
  prefix: string;
  content: string;
  onClose: () => void;
  onSave: (key: string, content: string) => void;
}

export function EditorModal({ fileKey, fileName, isNew, prefix, content: initialContent, onClose, onSave }: EditorModalProps) {
  const [name, setName] = useState(fileName);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const dirty = content !== initialContent || (isNew && name.trim().length > 0);

  const handleSave = async () => {
    setSaving(true);
    if (isNew) {
      if (!name.trim()) return;
      const key = prefix ? (prefix.endsWith("/") ? prefix + name.trim() : prefix + "/" + name.trim()) : name.trim();
      onSave(key, content);
    } else {
      onSave(fileKey, content);
    }
  };

  return (
    <Scrim onClose={!saving ? onClose : undefined}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-surface-container-low shadow-elev-5 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 md:px-6 py-3 md:py-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-container text-primary shrink-0">
            <Icon name={isNew ? "note_add" : "edit_document"} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {isNew ? "New file" : "Editing file"}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {isNew ? `in /${prefix || "root"}` : `/${fileKey}`}
            </div>
          </div>
          {dirty && <Chip tone="tertiary" icon="bolt">Unsaved</Chip>}
          <IconButton icon="close" onClick={onClose} disabled={saving} />
        </div>

        {/* Filename input for new files */}
        {isNew && (
          <div className="px-4 md:px-6 py-3 border-b">
            <TextField
              label="Filename"
              icon="draft"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="example.ts"
              autoFocus
              disabled={saving}
            />
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-hidden bg-surface-container-lowest min-h-[450px]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 bg-transparent font-mono text-[12.5px] leading-[1.7] text-foreground outline-none resize-none"
            spellCheck={false}
            placeholder="Enter file content…"
            disabled={saving}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t bg-surface-container-low px-4 md:px-5 py-3 flex-wrap">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>UTF-8 · LF</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="text" onClick={onClose} disabled={saving}>Discard</Button>
            <Button icon="save" onClick={handleSave} disabled={!dirty || (isNew && !name.trim())} loading={saving}>
              Save to S3
            </Button>
          </div>
        </div>
      </div>
    </Scrim>
  );
}
