const BASE = "/api";

async function handle(res: Response, operation: string) {
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("session_expired");
  }
  if (res.headers.get("Content-Disposition")) {
    if (!res.ok) throw new Error(await res.text() || "Download failed");
    return res;
  }
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || data.message || `${operation} failed`);
  }
  return data;
}

// Global AbortController for cancellable operations
let currentController: AbortController | null = null;

export function cancelCurrentRequest() {
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}

function getSignal(): AbortSignal {
  currentController = new AbortController();
  return currentController.signal;
}

function clearController() {
  currentController = null;
}

export const api = {
  async getProfiles() {
    const res = await fetch(`${BASE}/profiles`);
    return handle(res, "Profiles");
  },

  async connect(creds: {
    access_key: string;
    secret_key: string;
    region: string;
    bucket_name: string;
    base_path?: string;
  }) {
    const res = await fetch(`${BASE}/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
    });
    return handle(res, "Connect");
  },

  async connectProfile(profileName: string) {
    const res = await fetch(`${BASE}/connect-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: profileName }),
    });
    return handle(res, "Connect Profile");
  },

  async disconnect() {
    const res = await fetch(`${BASE}/disconnect`, { method: "DELETE" });
    return handle(res, "Disconnect");
  },

  async browse(prefix: string) {
    const signal = getSignal();
    try {
      const res = await fetch(`${BASE}/browse?prefix=${encodeURIComponent(prefix || "")}`, { signal });
      return handle(res, "Browse");
    } finally {
      clearController();
    }
  },

  async upload(prefix: string, files: FileList | File[], signal?: AbortSignal) {
    const formData = new FormData();
    formData.append("prefix", prefix);
    for (let i = 0; i < files.length; i++) {
      formData.append("files[]", files[i]);
    }
    const res = await fetch(`${BASE}/upload`, { method: "POST", body: formData, signal });
    return handle(res, "Upload");
  },

  async uploadFolder(prefix: string, files: File[], paths: string[], signal?: AbortSignal) {
    const formData = new FormData();
    formData.append("prefix", prefix);
    for (let i = 0; i < files.length; i++) {
      formData.append("files[]", files[i]);
      formData.append("paths[]", paths[i]);
    }
    const res = await fetch(`${BASE}/upload-folder`, { method: "POST", body: formData, signal });
    return handle(res, "Upload Folder");
  },

  async download(key: string) {
    const signal = getSignal();
    try {
      const res = await fetch(`${BASE}/download?key=${encodeURIComponent(key)}`, { signal });
      return handle(res, "Download");
    } finally {
      clearController();
    }
  },

  async readFile(key: string) {
    const signal = getSignal();
    try {
      const res = await fetch(`${BASE}/read?key=${encodeURIComponent(key)}`, { signal });
      return handle(res, "Read");
    } finally {
      clearController();
    }
  },

  async writeFile(key: string, content: string) {
    const signal = getSignal();
    try {
      const res = await fetch(`${BASE}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, content }),
        signal,
      });
      return handle(res, "Write");
    } finally {
      clearController();
    }
  },

  async deleteFiles(keys: string[]) {
    const signal = getSignal();
    try {
      const res = await fetch(`${BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
        signal,
      });
      return handle(res, "Delete");
    } finally {
      clearController();
    }
  },

  async rename(oldKey: string, newKey: string, isFolder: boolean) {
    const signal = getSignal();
    try {
      const res = await fetch(`${BASE}/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_key: oldKey, new_key: newKey, is_folder: isFolder }),
        signal,
      });
      return handle(res, "Rename");
    } finally {
      clearController();
    }
  },

  async createFolder(prefix: string, name: string) {
    const signal = getSignal();
    try {
      const res = await fetch(`${BASE}/create-folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix, name }),
        signal,
      });
      return handle(res, "Create Folder");
    } finally {
      clearController();
    }
  },

  async resolvePath(path: string) {
    const signal = getSignal();
    try {
      const res = await fetch(`${BASE}/resolve-path?path=${encodeURIComponent(path)}`, { signal });
      return handle(res, "Resolve Path");
    } finally {
      clearController();
    }
  },
};
