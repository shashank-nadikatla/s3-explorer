import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Icon } from "@/components/Icon";
import { Button, IconButton } from "@/components/Button";
import { api, cancelCurrentRequest } from "@/lib/api";
import { Chip } from "@/components/Chip";
import { getFileType, typeMeta, formatSize, formatDate } from "@/lib/fileTypes";
import { TopAppBar } from "@/components/TopAppBar";
import { FolderTreePanel } from "@/components/FolderTree";
import { FileList } from "@/components/FileList";
import { ContentPreview } from "@/components/ContentPreview";
import { RenameDialog } from "@/components/dialogs/RenameDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { EditorModal } from "@/components/dialogs/EditorModal";
import { UploadSheet } from "@/components/dialogs/UploadSheet";
import { NewFolderDialog } from "@/components/dialogs/NewFolderDialog";

export interface S3File {
  key: string;
  name: string;
  size: number;
  last_modified: string;
}

export interface BrowseData {
  folders: string[];
  files: S3File[];
  prefix: string;
}

type Dialog =
  | { kind: "none" }
  | { kind: "rename"; name: string; key: string; isFolder: boolean }
  | { kind: "delete"; keys: string[] }
  | { kind: "editor"; key: string; name: string; isNew: boolean }
  | { kind: "upload" }
  | { kind: "newFolder" };

export default function BrowserPage() {
  const navigate = useNavigate();
  const [prefix, setPrefix] = useState("");
  const [data, setData] = useState<BrowseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.min(500, Math.max(200, startWidth + (ev.clientX - startX)));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const loadTree = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const result = await api.browse(p);
      setData(result);
      setPrefix(result.prefix || p);
      setSelected(new Set());
    } catch (err: any) {
      if (err.message === "session_expired") return;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree("");
  }, [loadTree]);

  const navigateTo = (p: string) => {
    setPreviewKey(null);
    setPreviewContent(null);
    loadTree(p);
  };

  const handleDisconnect = async () => {
    try {
      await api.disconnect();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const handleFileClick = async (file: S3File) => {
    setPreviewName(file.name);
    setPreviewKey(file.key);
    setPreviewContent(null);
    try {
      const result = await api.readFile(file.key);
      setPreviewContent(result.content);
    } catch (err: any) {
      if (err.message?.includes("binary")) {
        setPreviewContent("__BINARY__");
      } else {
        setPreviewContent(`Error: ${err.message}`);
      }
    }
  };

  const handleDownload = async (key: string) => {
    try {
      const res = await api.download(key);
      const blob = await (res as Response).blob();
      const name = key.split("/").pop() || "download";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${name}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (keys: string[]) => {
    try {
      await api.deleteFiles(keys);
      toast.success(`Deleted ${keys.length} item${keys.length > 1 ? "s" : ""}`);
      setSelected(new Set());
      if (previewKey && keys.includes(previewKey)) {
        setPreviewKey(null);
        setPreviewContent(null);
      }
      loadTree(prefix);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDialog({ kind: "none" });
    }
  };

  const handleRename = async (oldKey: string, newKey: string, isFolder: boolean) => {
    try {
      await api.rename(oldKey, newKey, isFolder);
      toast.success("Renamed successfully");
      setDialog({ kind: "none" });
      loadTree(prefix);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveFile = async (key: string, content: string) => {
    try {
      await api.writeFile(key, content);
      toast.success("Saved to S3");
      setDialog({ kind: "none" });
      loadTree(prefix);
      if (previewKey === key) {
        setPreviewContent(content);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await api.createFolder(prefix, name);
      toast.success(`Created folder: ${name}`);
      setDialog({ kind: "none" });
      loadTree(prefix);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpload = async (files: FileList | File[]) => {
    try {
      const result = await api.upload(prefix, files);
      if (result.uploaded?.length) {
        toast.success(`Uploaded ${result.uploaded.length} file(s)`);
      }
      setDialog({ kind: "none" });
      loadTree(prefix);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGoPath = async (path: string) => {
    setLoading(true);
    try {
      const result = await api.resolvePath(path);
      if (result.type === "folder") {
        // navigateTo calls loadTree which manages its own loading state
        navigateTo(result.prefix);
      } else if (result.type === "file") {
        const parts = result.key.split("/");
        const fileName = parts.pop()!;
        const parentPrefix = parts.length > 0 ? parts.join("/") + "/" : "";
        setPrefix(parentPrefix);
        await loadTree(parentPrefix);
        handleFileClick({ key: result.key, name: fileName, size: 0, last_modified: "" });
      } else {
        setLoading(false);
        toast.error("Path not found");
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  const toggleSelect = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      <TopAppBar
        prefix={prefix}
        loading={loading}
        onMenu={() => setDrawerOpen(true)}
        onSearch={handleGoPath}
        onDisconnect={handleDisconnect}
        onCancel={() => {
          cancelCurrentRequest();
          setLoading(false);
          toast("Operation cancelled");
        }}
      />

      {/* Loading bar — always present, color shows during loading */}
      <div className="h-1 w-full bg-surface-container overflow-hidden shrink-0">
        {loading && (
          <div className="h-full w-2/5 bg-primary rounded-full animate-[slideRight_1s_ease-in-out_infinite]" />
        )}
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* Sidebar — desktop (resizable) */}
        <aside
          className="hidden md:flex flex-col border-r bg-surface-container-low overflow-hidden"
          style={{ width: sidebarWidth, minWidth: 200, maxWidth: 500 }}
        >
          <FolderTreePanel
            currentPrefix={prefix}
            data={data}
            onNavigate={navigateTo}
          />
        </aside>

        {/* Resize handle */}
        <div
          className="hidden md:flex w-1 cursor-col-resize items-center justify-center hover:bg-primary/20 active:bg-primary/30 transition-colors"
          onMouseDown={handleResizeStart}
        >
          <div className="w-0.5 h-8 rounded-full bg-outline-variant" />
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface-container-low shadow-elev-4 overflow-auto">
              <div className="flex items-center justify-between border-b px-3 py-3">
                <span className="text-sm font-semibold">Navigation</span>
                <IconButton icon="close" onClick={() => setDrawerOpen(false)} />
              </div>
              <FolderTreePanel
                currentPrefix={prefix}
                data={data}
                onNavigate={(p) => {
                  navigateTo(p);
                  setDrawerOpen(false);
                }}
              />
            </aside>
          </div>
        )}

        {/* Main file list */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <FileList
            prefix={prefix}
            data={data}
            selected={selected}
            previewKey={previewKey}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNavigate={navigateTo}
            onFileClick={handleFileClick}
            onToggleSelect={toggleSelect}
            onUpload={() => setDialog({ kind: "upload" })}
            onNewFolder={() => setDialog({ kind: "newFolder" })}
            onNewFile={() => setDialog({ kind: "editor", key: "", name: "", isNew: true })}
            onRename={(name, key, isFolder) => setDialog({ kind: "rename", name, key, isFolder })}
            onDelete={(keys) => setDialog({ kind: "delete", keys })}
          />

          {/* Selection action bar */}
          {selected.size > 0 && (
            <div className="m-3 md:m-4 flex items-center gap-3 rounded-2xl bg-inverse-surface px-4 py-2.5 text-inverse-on-surface shadow-elev-3">
              <Icon name="check_circle" />
              <span className="text-sm font-medium">{selected.size} selected</span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => {
                    selected.forEach((k) => handleDownload(k));
                  }}
                  className="rounded-full px-3 py-1.5 text-xs hover:bg-white/10 inline-flex items-center gap-1"
                >
                  <Icon name="download" size={16} /> <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={() => setDialog({ kind: "delete", keys: Array.from(selected) })}
                  className="rounded-full px-3 py-1.5 text-xs text-inverse-on-surface hover:bg-white/10 transition-colors inline-flex items-center gap-1"
                >
                  <Icon name="delete" size={16} /> <span className="hidden sm:inline">Delete</span>
                </button>
                <IconButton
                  icon="close"
                  size={32}
                  onClick={() => setSelected(new Set())}
                  className="ml-1 text-inverse-on-surface hover:!bg-white/10"
                />
              </div>
            </div>
          )}
        </main>

        {/* Preview panel — desktop */}
        {previewKey && (
          <aside className="hidden lg:flex w-[460px] shrink-0 border-l bg-surface-container-low flex-col overflow-hidden">
            <ContentPreview
              fileKey={previewKey}
              fileName={previewName}
              content={previewContent}
              onClose={() => {
                setPreviewKey(null);
                setPreviewContent(null);
              }}
              onEdit={() => setDialog({ kind: "editor", key: previewKey, name: previewName, isNew: false })}
              onDownload={() => handleDownload(previewKey)}
            />
          </aside>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setDialog({ kind: "upload" })}
        className="md:hidden fixed bottom-20 right-5 z-30 flex h-14 items-center gap-2 rounded-2xl bg-primary px-5 text-primary-foreground shadow-elev-4"
      >
        <Icon name="upload" /> Upload
      </button>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t bg-surface-container-low pb-2 pt-1.5">
        <button onClick={() => {}} className="flex flex-col items-center gap-0.5 px-3 py-1">
          <span className="grid h-8 w-14 place-items-center rounded-full bg-secondary-container text-on-secondary-container">
            <Icon name="folder" size={20} />
          </span>
          <span className="text-[10px] font-semibold">Files</span>
        </button>
        <button onClick={() => setDialog({ kind: "upload" })} className="flex flex-col items-center gap-0.5 px-3 py-1">
          <span className="grid h-8 w-14 place-items-center rounded-full text-muted-foreground">
            <Icon name="upload" size={20} />
          </span>
          <span className="text-[10px] text-muted-foreground">Upload</span>
        </button>
        <button onClick={handleDisconnect} className="flex flex-col items-center gap-0.5 px-3 py-1">
          <span className="grid h-8 w-14 place-items-center rounded-full text-muted-foreground">
            <Icon name="logout" size={20} />
          </span>
          <span className="text-[10px] text-muted-foreground">Disconnect</span>
        </button>
      </nav>

      {/* Dialogs */}
      {dialog.kind === "rename" && (
        <RenameDialog
          name={dialog.name}
          fileKey={dialog.key}
          isFolder={dialog.isFolder}
          prefix={prefix}
          onCancel={() => setDialog({ kind: "none" })}
          onConfirm={handleRename}
        />
      )}
      {dialog.kind === "delete" && (
        <DeleteDialog
          keys={dialog.keys}
          onCancel={() => setDialog({ kind: "none" })}
          onConfirm={() => handleDelete(dialog.keys)}
        />
      )}
      {dialog.kind === "editor" && (
        <EditorModal
          fileKey={dialog.key}
          fileName={dialog.name}
          isNew={dialog.isNew}
          prefix={prefix}
          content={dialog.isNew ? "" : previewContent || ""}
          onClose={() => setDialog({ kind: "none" })}
          onSave={handleSaveFile}
        />
      )}
      {dialog.kind === "upload" && (
        <UploadSheet
          prefix={prefix}
          onClose={() => setDialog({ kind: "none" })}
          onUpload={handleUpload}
        />
      )}
      {dialog.kind === "newFolder" && (
        <NewFolderDialog
          onCancel={() => setDialog({ kind: "none" })}
          onConfirm={handleCreateFolder}
        />
      )}
    </div>
  );
}
