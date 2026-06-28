import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";
import type { BrowseData } from "@/pages/BrowserPage";

interface FolderTreePanelProps {
  currentPrefix: string;
  data: BrowseData | null;
  onNavigate: (prefix: string) => void;
}

export function FolderTreePanel({ currentPrefix, data, onNavigate }: FolderTreePanelProps) {
  const segments = currentPrefix.split("/").filter(Boolean);

  return (
    <nav className="space-y-0.5 p-3 overflow-auto h-full">
      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Navigation
      </div>

      {/* Root */}
      <Tooltip text="Root">
        <button
          onClick={() => onNavigate("")}
          className={`w-full flex items-center gap-2 rounded-full px-3 py-2 text-sm text-left ${
            currentPrefix === ""
              ? "bg-secondary-container text-on-secondary-container font-semibold"
              : "text-foreground hover:bg-surface-container"
          }`}
        >
          <Icon name="home" size={18} className="text-on-surface-variant" />
          <span className="truncate">Root</span>
        </button>
      </Tooltip>

      {/* Breadcrumb path as expandable tree */}
      {segments.map((seg, i) => {
        const segPath = segments.slice(0, i + 1).join("/") + "/";
        const isLast = i === segments.length - 1;
        return (
          <Tooltip key={segPath} text={segPath}>
            <button
              onClick={() => onNavigate(segPath)}
              className={`w-full flex items-center gap-2 rounded-full py-2 pr-3 text-sm text-left ${
                isLast
                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                  : "text-foreground hover:bg-surface-container"
              }`}
              style={{ paddingLeft: 12 + (i + 1) * 16 }}
            >
              <Icon
                name={isLast ? "folder_open" : "folder"}
                size={18}
                className={isLast ? "text-secondary" : "text-on-surface-variant"}
              />
              <span className="truncate">{seg}</span>
            </button>
          </Tooltip>
        );
      })}

      {/* Current folder contents (subfolders) */}
      {data?.folders && data.folders.length > 0 && (
        <>
          <div className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Subfolders
          </div>
          {data.folders.map((folder) => {
            const name = folder.replace(currentPrefix, "").replace(/\/$/, "");
            return (
              <Tooltip key={folder} text={folder}>
                <button
                  onClick={() => onNavigate(folder)}
                  className="w-full flex items-center gap-2 rounded-full py-2 pr-3 text-sm text-left text-foreground hover:bg-surface-container"
                  style={{ paddingLeft: 12 + (segments.length + 1) * 16 }}
                >
                  <Icon name="folder" size={18} className="text-on-surface-variant" />
                  <span className="truncate">{name}</span>
                </button>
              </Tooltip>
            );
          })}
        </>
      )}
    </nav>
  );
}
