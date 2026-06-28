import { Icon } from "./Icon";
import { Button, IconButton } from "./Button";
import { Chip } from "./Chip";
import { getFileType, typeMeta, formatSize, formatDate } from "@/lib/fileTypes";
import type { BrowseData, S3File } from "@/pages/BrowserPage";

interface FileListProps {
  prefix: string;
  data: BrowseData | null;
  selected: Set<string>;
  previewKey: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: (prefix: string) => void;
  onFileClick: (file: S3File) => void;
  onToggleSelect: (key: string) => void;
  onUpload: () => void;
  onNewFolder: () => void;
  onNewFile: () => void;
  onRename: (name: string, key: string, isFolder: boolean) => void;
  onDelete: (keys: string[]) => void;
}

export function FileList({
  prefix,
  data,
  selected,
  previewKey,
  searchQuery,
  onSearchChange,
  onNavigate,
  onFileClick,
  onToggleSelect,
  onUpload,
  onNewFolder,
  onNewFile,
  onRename,
  onDelete,
}: FileListProps) {
  const segments = prefix.split("/").filter(Boolean);
  const query = searchQuery.toLowerCase();

  const folders = (data?.folders || []).filter((f) => {
    if (!query) return true;
    const name = f.replace(prefix, "").replace(/\/$/, "");
    return name.toLowerCase().includes(query);
  });

  const files = (data?.files || []).filter((f) => {
    if (!query) return true;
    return f.name.toLowerCase().includes(query);
  });

  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="flex flex-col overflow-hidden flex-1">
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4 md:px-6 py-3 md:py-4">
        <div className="space-y-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm overflow-x-auto">
            <button
              onClick={() => onNavigate("")}
              className={`rounded-full px-3 py-1.5 shrink-0 ${
                prefix === ""
                  ? "bg-primary-container text-on-primary-container font-semibold"
                  : "text-muted-foreground hover:bg-surface-container"
              }`}
            >
              Root
            </button>
            {segments.map((seg, i) => {
              const target = segments.slice(0, i + 1).join("/") + "/";
              const isLast = i === segments.length - 1;
              return (
                <span key={target} className="flex items-center gap-1 shrink-0">
                  <Icon name="chevron_right" size={16} className="text-on-surface-variant" />
                  <button
                    onClick={() => onNavigate(target)}
                    className={`rounded-full px-3 py-1.5 ${
                      isLast
                        ? "bg-primary-container text-on-primary-container font-semibold"
                        : "text-muted-foreground hover:bg-surface-container"
                    }`}
                  >
                    {seg}
                  </button>
                </span>
              );
            })}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {folders.length + files.length} items
            {selected.size > 0 && ` · ${selected.size} selected`}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="tonal" icon="create_new_folder" onClick={onNewFolder} className="hidden md:inline-flex">
            New folder
          </Button>
          <Button variant="tonal" icon="note_add" onClick={onNewFile} className="hidden md:inline-flex">
            New file
          </Button>
          <Button icon="upload" onClick={onUpload} className="hidden md:inline-flex">
            Upload
          </Button>
          <IconButton icon="more_vert" className="md:hidden" />
        </div>
      </div>

      {/* Search bar */}
      <div className="border-b px-4 py-2">
        <div className="flex items-center gap-2 rounded-full bg-surface-container px-4 h-9">
          <Icon name="filter_list" size={18} className="text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter files…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <IconButton icon="close" size={24} onClick={() => onSearchChange("")} />
          )}
        </div>
      </div>

      {/* Column headers — desktop */}
      <div className="hidden md:grid grid-cols-[28px_36px_1fr_100px_100px_140px_40px] gap-3 border-b px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <span />
        <span />
        <span>Name</span>
        <span>Type</span>
        <span>Size</span>
        <span>Modified</span>
        <span />
      </div>

      {/* File rows */}
      <div className="flex-1 min-h-0 overflow-auto p-2 space-y-1">
        {isEmpty && !data ? (
          <div className="grid place-items-center h-full">
            <div className="text-center text-muted-foreground">
              <Icon name="hourglass_empty" size={48} className="opacity-50 mb-2" />
              <p className="text-sm">Loading…</p>
            </div>
          </div>
        ) : isEmpty ? (
          <EmptyState onUpload={onUpload} onNewFolder={onNewFolder} />
        ) : (
          <>
            {folders.map((folder) => {
              const name = folder.replace(prefix, "").replace(/\/$/, "");
              return (
                <FolderRow
                  key={folder}
                  name={name}
                  folderPath={folder}
                  onOpen={() => onNavigate(folder)}
                  onRename={() => onRename(name, folder, true)}
                />
              );
            })}
            {files.map((file) => (
              <FileRow
                key={file.key}
                file={file}
                active={previewKey === file.key}
                selected={selected.has(file.key)}
                onOpen={() => onFileClick(file)}
                onToggle={() => onToggleSelect(file.key)}
                onRename={() => onRename(file.name, file.key, false)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function FolderRow({
  name,
  folderPath,
  onOpen,
  onRename,
}: {
  name: string;
  folderPath: string;
  onOpen: () => void;
  onRename: () => void;
}) {
  return (
    <div
      className="group grid items-center gap-3 rounded-2xl px-2 md:px-3 py-2.5 text-sm transition-colors cursor-pointer hover:bg-surface-container-low grid-cols-[28px_36px_1fr_40px] md:grid-cols-[28px_36px_1fr_100px_100px_140px_40px]"
      onClick={onOpen}
    >
      <span />
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary-container text-secondary">
        <Icon name="folder" size={20} />
      </span>
      <div className="min-w-0">
        <div className="truncate font-medium">{name}</div>
      </div>
      <span className="hidden md:inline text-xs text-muted-foreground">Folder</span>
      <span className="hidden md:inline" />
      <span className="hidden md:inline" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
        className="grid h-8 w-8 place-items-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-surface-container"
      >
        <Icon name="more_vert" size={18} />
      </button>
    </div>
  );
}

function FileRow({
  file,
  active,
  selected,
  onOpen,
  onToggle,
  onRename,
}: {
  file: S3File;
  active: boolean;
  selected: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onRename: () => void;
}) {
  const fileType = getFileType(file.name);
  const meta = typeMeta[fileType];

  return (
    <div
      className={`group grid items-center gap-3 rounded-2xl px-2 md:px-3 py-2.5 text-sm transition-colors cursor-pointer
        grid-cols-[28px_36px_1fr_40px] md:grid-cols-[28px_36px_1fr_100px_100px_140px_40px] ${
          active
            ? "bg-primary-container text-on-primary-container"
            : selected
              ? "bg-secondary-container text-on-secondary-container"
              : "hover:bg-surface-container-low"
        }`}
      onClick={onOpen}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`grid h-5 w-5 place-items-center rounded ${
          selected || active ? "bg-primary text-primary-foreground" : "border border-outline"
        }`}
      >
        {(selected || active) && <Icon name="check" size={14} />}
      </button>
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${meta.tone}`}>
        <Icon name={meta.icon} size={20} />
      </span>
      <div className="min-w-0">
        <div className="truncate font-medium">{file.name}</div>
        <div className="text-[11px] text-muted-foreground md:hidden">
          {formatSize(file.size)} · {formatDate(file.last_modified)}
        </div>
      </div>
      <span className="hidden md:inline text-xs text-muted-foreground">{meta.label}</span>
      <span className="hidden md:inline text-xs text-muted-foreground">{formatSize(file.size)}</span>
      <span className="hidden md:inline text-xs text-muted-foreground">{formatDate(file.last_modified)}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
        className="grid h-8 w-8 place-items-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-surface-container"
      >
        <Icon name="more_vert" size={18} />
      </button>
    </div>
  );
}

function EmptyState({ onUpload, onNewFolder }: { onUpload: () => void; onNewFolder: () => void }) {
  return (
    <div className="grid place-items-center p-10 h-full">
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-40 w-40">
          <div className="absolute inset-0 rounded-[44px] bg-primary-container blur-2xl opacity-60" />
          <div className="relative grid h-full w-full place-items-center rounded-[44px] bg-surface-container-low shadow-elev-2">
            <Icon name="cloud_upload" size={88} className="text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">This folder is empty</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Drop files anywhere, paste a path into the search bar, or create something new.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button icon="upload" onClick={onUpload}>Upload files</Button>
          <Button variant="tonal" icon="create_new_folder" onClick={onNewFolder}>New folder</Button>
        </div>
      </div>
    </div>
  );
}
