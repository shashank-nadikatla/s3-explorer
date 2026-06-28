export type FileType = "folder" | "image" | "code" | "doc" | "md" | "pdf" | "zip" | "video" | "audio" | "generic";

export const typeMeta: Record<FileType, { icon: string; tone: string; label: string }> = {
  folder: { icon: "folder", tone: "bg-secondary-container text-secondary", label: "Folder" },
  image: { icon: "image", tone: "bg-tertiary-container text-tertiary", label: "Image" },
  code: { icon: "code", tone: "bg-primary-container text-primary", label: "Code" },
  doc: { icon: "description", tone: "bg-surface-container-high text-on-surface-variant", label: "Document" },
  md: { icon: "article", tone: "bg-primary-container text-primary", label: "Markdown" },
  pdf: { icon: "picture_as_pdf", tone: "bg-error-container text-on-error-container", label: "PDF" },
  zip: { icon: "folder_zip", tone: "bg-tertiary-container text-on-tertiary-container", label: "Archive" },
  video: { icon: "movie", tone: "bg-secondary-container text-on-secondary-container", label: "Video" },
  audio: { icon: "music_note", tone: "bg-tertiary-container text-tertiary", label: "Audio" },
  generic: { icon: "draft", tone: "bg-surface-container-high text-on-surface-variant", label: "File" },
};

const EXT_MAP: Record<string, FileType> = {
  // Code
  ts: "code", tsx: "code", js: "code", jsx: "code", py: "code", rb: "code",
  go: "code", rs: "code", java: "code", c: "code", cpp: "code", h: "code",
  css: "code", scss: "code", html: "code", vue: "code", svelte: "code",
  json: "code", yaml: "code", yml: "code", toml: "code", xml: "code",
  sh: "code", bash: "code", sql: "code", graphql: "code", tf: "code",
  // Markdown
  md: "md", mdx: "md",
  // Images
  png: "image", jpg: "image", jpeg: "image", gif: "image", svg: "image",
  webp: "image", ico: "image", bmp: "image", avif: "image",
  // Video
  mp4: "video", webm: "video", mov: "video", avi: "video", mkv: "video",
  // Audio
  mp3: "audio", wav: "audio", ogg: "audio", flac: "audio",
  // PDF
  pdf: "pdf",
  // Archives
  zip: "zip", tar: "zip", gz: "zip", rar: "zip", "7z": "zip",
  // Docs
  doc: "doc", docx: "doc", txt: "doc", rtf: "doc", csv: "doc", xls: "doc", xlsx: "doc",
};

export function getFileType(name: string): FileType {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return EXT_MAP[ext] || "generic";
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return val.toFixed(i === 0 ? 0 : 1) + " " + units[i];
}

export function formatDate(isoStr: string): string {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
