import { useState } from "react";
import { Icon } from "./Icon";
import { IconButton } from "./Button";
import { Chip } from "./Chip";

interface TopAppBarProps {
  prefix: string;
  loading: boolean;
  onMenu: () => void;
  onSearch: (path: string) => void;
  onDisconnect: () => void;
  onCancel: () => void;
}

export function TopAppBar({ prefix, loading, onMenu, onSearch, onDisconnect, onCancel }: TopAppBarProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchValue.trim()) {
      onSearch(searchValue.trim());
      setSearchValue("");
    }
  };

  return (
    <header className="h-16 shrink-0 flex items-center gap-3 border-b bg-surface-container-low px-3 md:px-5">
      <IconButton icon="menu" onClick={onMenu} className="md:hidden" />
      <div className="flex items-center gap-2 min-w-0">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0">
          <Icon name="cloud" size={18} />
        </div>
        <div className="min-w-0 hidden sm:block">
          <div className="text-sm font-semibold leading-tight truncate">S3</div>
          <div className="text-[10px] text-muted-foreground truncate">File Explorer</div>
        </div>
      </div>

      {/* Search field — desktop */}
      <div className="hidden md:flex ml-4 h-11 flex-1 mr-12 items-center gap-3 rounded-full bg-surface-container px-5">
        <Icon name="search" size={20} className="text-on-surface-variant" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchSubmit}
          placeholder="Filter files or paste full path…"
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {prefix && <Chip icon="folder_open">/{prefix || "root"}</Chip>}
      </div>

      <div className="md:hidden flex-1" />

      <div className="ml-auto flex items-center gap-1">
        {loading && (
          <IconButton icon="close" onClick={onCancel} className="text-error" />
        )}
        <button
          onClick={onDisconnect}
          className="hidden sm:flex ml-2 items-center gap-2 rounded-full bg-tertiary-container px-3 py-1.5 text-xs font-medium text-on-tertiary-container"
        >
          <Icon name="logout" size={16} /> Disconnect
        </button>
      </div>
    </header>
  );
}
