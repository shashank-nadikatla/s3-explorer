import { Router, type Request, type Response } from "express";
import Busboy from "busboy";
import {
  getClient,
  listPrefix,
  readObject,
  writeObject,
  deleteObject,
  copyObject,
  headObject,
  getObjectStream,
  uploadBuffer,
  type Creds,
} from "./s3.js";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

// Extend session type
declare module "express-session" {
  interface SessionData {
    access_key: string;
    secret_key: string;
    region: string;
    bucket_name: string;
    base_path: string;
  }
}

export const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadProfiles() {
  const raw = process.env.S3_PROFILES || "";
  if (!raw) return [];
  try {
    const profiles = JSON.parse(raw);
    return Array.isArray(profiles) ? profiles : [];
  } catch {
    return [];
  }
}

function requireSession(req: Request, res: Response): Creds | null {
  if (!req.session.access_key) {
    res.status(401).json({ ok: false, error: "session_expired" });
    return null;
  }
  return {
    access_key: req.session.access_key,
    secret_key: req.session.secret_key!,
    region: req.session.region!,
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /api/profiles
router.get("/profiles", (_req, res) => {
  const profiles = loadProfiles();
  const names = profiles
    .filter((p: any) => p.name)
    .map((p: any) => ({
      name: p.name,
      region: p.region || "",
      bucket_name: p.bucket_name || "",
    }));
  res.json({ ok: true, profiles: names });
});

// POST /api/connect-profile
router.post("/connect-profile", async (req: Request, res: Response) => {
  const { profile: profileName } = req.body || {};
  if (!profileName) {
    res.status(400).json({ ok: false, error: "Missing 'profile' field" });
    return;
  }

  const profiles = loadProfiles();
  const profile = profiles.find((p: any) => p.name === profileName);
  if (!profile) {
    res.status(404).json({ ok: false, error: `Profile '${profileName}' not found` });
    return;
  }

  const required = ["access_key", "secret_key", "region", "bucket_name"];
  const missing = required.filter((f) => !profile[f]);
  if (missing.length) {
    res.status(400).json({ ok: false, error: `Profile missing: ${missing.join(", ")}` });
    return;
  }

  // Validate
  try {
    const client = getClient(profile);
    await client.send(
      new ListObjectsV2Command({
        Bucket: profile.bucket_name,
        Prefix: profile.base_path || "",
        MaxKeys: 1,
      })
    );
  } catch (err: any) {
    res.status(400).json({ ok: false, error: `Invalid: ${err.message}` });
    return;
  }

  req.session.access_key = profile.access_key;
  req.session.secret_key = profile.secret_key;
  req.session.region = profile.region;
  req.session.bucket_name = profile.bucket_name;
  req.session.base_path = profile.base_path || "";

  res.json({ ok: true, bucket_name: profile.bucket_name, base_path: profile.base_path || "" });
});

// POST /api/connect
router.post("/connect", async (req: Request, res: Response) => {
  const { access_key, secret_key, region, bucket_name, base_path } = req.body || {};

  const required = { access_key, secret_key, region, bucket_name };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    res.status(400).json({ ok: false, error: `Missing: ${missing.join(", ")}` });
    return;
  }

  const creds: Creds = { access_key, secret_key, region };
  try {
    const client = getClient(creds);
    await client.send(
      new ListObjectsV2Command({
        Bucket: bucket_name,
        Prefix: base_path || "",
        MaxKeys: 1,
      })
    );
  } catch (err: any) {
    res.status(400).json({ ok: false, error: `Invalid credentials: ${err.message}` });
    return;
  }

  req.session.access_key = access_key;
  req.session.secret_key = secret_key;
  req.session.region = region;
  req.session.bucket_name = bucket_name;
  req.session.base_path = base_path || "";

  res.json({ ok: true });
});

// DELETE /api/disconnect
router.delete("/disconnect", (req, res) => {
  req.session.destroy(() => {});
  res.json({ ok: true });
});

// GET /api/browse
router.get("/browse", async (req: Request, res: Response) => {
  const creds = requireSession(req, res);
  if (!creds) return;

  const prefix = (req.query.prefix as string) || req.session.base_path || "";
  try {
    const result = await listPrefix(prefix, req.session.bucket_name!, creds);
    res.json({ ...result, prefix, ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/upload (multipart)
router.post("/upload", (req: Request, res: Response) => {
  const creds = requireSession(req, res);
  if (!creds) return;

  const busboy = Busboy({ headers: req.headers });
  let prefix = "";
  const uploaded: string[] = [];
  const errors: Array<{ file: string; error: string }> = [];
  const uploads: Promise<void>[] = [];

  busboy.on("field", (name, val) => {
    if (name === "prefix") prefix = val;
  });

  busboy.on("file", (_fieldname, stream, info) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    const uploadPromise = new Promise<void>((resolve) => {
      stream.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        const key = prefix
          ? prefix.endsWith("/")
            ? prefix + info.filename
            : prefix + "/" + info.filename
          : info.filename;
        try {
          await uploadBuffer(key, buffer, req.session.bucket_name!, creds);
          uploaded.push(info.filename);
        } catch (err: any) {
          errors.push({ file: info.filename, error: err.message });
        }
        resolve();
      });
    });
    uploads.push(uploadPromise);
  });

  busboy.on("finish", async () => {
    await Promise.all(uploads);
    if (errors.length) {
      res.status(207).json({ ok: false, uploaded, errors });
    } else {
      res.json({ ok: true, uploaded });
    }
  });

  req.pipe(busboy);
});

// POST /api/upload-folder (multipart with paths)
router.post("/upload-folder", (req: Request, res: Response) => {
  const creds = requireSession(req, res);
  if (!creds) return;

  const busboy = Busboy({ headers: req.headers });
  let prefix = "";
  const paths: string[] = [];
  const uploaded: string[] = [];
  const errors: Array<{ file: string; error: string }> = [];
  const uploads: Promise<void>[] = [];
  let fileIndex = 0;

  busboy.on("field", (name, val) => {
    if (name === "prefix") prefix = val;
    if (name === "paths[]") paths.push(val);
  });

  busboy.on("file", (_fieldname, stream, info) => {
    const idx = fileIndex++;
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    const uploadPromise = new Promise<void>((resolve) => {
      stream.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        const relPath = paths[idx] || info.filename;
        const key = prefix
          ? prefix.endsWith("/")
            ? prefix + relPath
            : prefix + "/" + relPath
          : relPath;
        try {
          await uploadBuffer(key, buffer, req.session.bucket_name!, creds);
          uploaded.push(relPath);
        } catch (err: any) {
          errors.push({ file: relPath, error: err.message });
        }
        resolve();
      });
    });
    uploads.push(uploadPromise);
  });

  busboy.on("finish", async () => {
    await Promise.all(uploads);
    if (errors.length) {
      res.status(207).json({ ok: false, uploaded, errors });
    } else {
      res.json({ ok: true, uploaded });
    }
  });

  req.pipe(busboy);
});

// GET /api/download
router.get("/download", async (req: Request, res: Response) => {
  const creds = requireSession(req, res);
  if (!creds) return;

  const key = req.query.key as string;
  if (!key) {
    res.status(400).json({ ok: false, error: "Missing 'key'" });
    return;
  }

  try {
    const result = await getObjectStream(key, req.session.bucket_name!, creds);
    const basename = key.split("/").pop() || "download";
    res.setHeader("Content-Disposition", `attachment; filename="${basename}"`);
    res.setHeader("Content-Type", result.ContentType || "application/octet-stream");

    const body = result.Body as any;
    if (body?.pipe) {
      body.pipe(res);
    } else {
      const bytes = await body.transformToByteArray();
      res.send(Buffer.from(bytes));
    }
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/read
router.get("/read", async (req: Request, res: Response) => {
  const creds = requireSession(req, res);
  if (!creds) return;

  const key = req.query.key as string;
  if (!key) {
    res.status(400).json({ ok: false, error: "Missing 'key'" });
    return;
  }

  try {
    const content = await readObject(key, req.session.bucket_name!, creds);
    res.json({ ok: true, content });
  } catch (err: any) {
    if (err.name === "NoSuchKey") {
      res.status(404).json({ ok: false, error: "File not found" });
    } else {
      // Could be binary — check if it's a decode issue
      res.status(422).json({ ok: false, error: "binary_file", message: "Binary preview not supported" });
    }
  }
});

// POST /api/write
router.post("/write", async (req: Request, res: Response) => {
  const creds = requireSession(req, res);
  if (!creds) return;

  const { key, content } = req.body || {};
  if (!key) {
    res.status(400).json({ ok: false, error: "Missing 'key'" });
    return;
  }
  if (content === undefined || content === null) {
    res.status(400).json({ ok: false, error: "Missing 'content'" });
    return;
  }

  try {
    await writeObject(key, content, req.session.bucket_name!, creds);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/delete
router.delete("/delete", async (req: Request, res: Response) => {
  const creds = requireSession(req, res);
  if (!creds) return;

  const { keys } = req.body || {};
  if (!keys || !keys.length) {
    res.status(400).json({ ok: false, error: "No keys provided" });
    return;
  }

  const deleted: string[] = [];
  const errors: Array<{ key: string; error: string }> = [];

  for (const key of keys) {
    try {
      await deleteObject(key, req.session.bucket_name!, creds);
      deleted.push(key);
    } catch (err: any) {
      errors.push({ key, error: err.message });
    }
  }

  if (errors.length) {
    res.status(207).json({ ok: false, deleted, errors });
  } else {
    res.json({ ok: true, deleted });
  }
});

// POST /api/create-folder
router.post("/create-folder", async (req: Request, res: Response) => {
  const creds = requireSession(req, res);
  if (!creds) return;

  const { prefix, name } = req.body || {};
  if (!name?.trim()) {
    res.status(400).json({ ok: false, error: "Folder name is required" });
    return;
  }

  let key: string;
  if (prefix && !prefix.endsWith("/")) {
    key = prefix + "/" + name.trim() + "/";
  } else {
    key = (prefix || "") + name.trim() + "/";
  }

  try {
    await writeObject(key, "", req.session.bucket_name!, creds);
    res.json({ ok: true, key });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/rename
router.post("/rename", async (req: Request, res: Response) => {
  const creds = requireSession(req, res);
  if (!creds) return;

  const { old_key, new_key, is_folder } = req.body || {};
  if (!old_key || !new_key) {
    res.status(400).json({ ok: false, error: "Both old_key and new_key required" });
    return;
  }
  if (old_key === new_key) {
    res.status(400).json({ ok: false, error: "New name is same as old" });
    return;
  }

  const bucket = req.session.bucket_name!;
  const renamed: Array<{ from: string; to: string }> = [];
  const errors: Array<{ key: string; error: string }> = [];

  try {
    if (is_folder) {
      const oldPrefix = old_key.endsWith("/") ? old_key : old_key + "/";
      const newPrefix = new_key.endsWith("/") ? new_key : new_key + "/";

      const { files } = await listPrefix(oldPrefix, bucket, creds);
      // Also include the folder marker itself
      for (const file of [{ key: oldPrefix, name: "", size: 0, last_modified: "" }, ...files]) {
        const srcKey = file.key;
        const destKey = newPrefix + srcKey.slice(oldPrefix.length);
        try {
          await copyObject(srcKey, destKey, bucket, creds);
          await deleteObject(srcKey, bucket, creds);
          renamed.push({ from: srcKey, to: destKey });
        } catch (err: any) {
          errors.push({ key: srcKey, error: err.message });
        }
      }
    } else {
      await copyObject(old_key, new_key, bucket, creds);
      await deleteObject(old_key, bucket, creds);
      renamed.push({ from: old_key, to: new_key });
    }

    if (errors.length) {
      res.status(207).json({ ok: false, renamed, errors });
    } else {
      res.json({ ok: true, renamed });
    }
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/resolve-path
router.get("/resolve-path", async (req: Request, res: Response) => {
  const creds = requireSession(req, res);
  if (!creds) return;

  const path = (req.query.path as string)?.trim();
  if (!path) {
    res.status(400).json({ ok: false, error: "Missing 'path'" });
    return;
  }

  const bucket = req.session.bucket_name!;
  const basePath = req.session.base_path || "";

  const candidates = [path];
  if (basePath) {
    const bp = basePath.endsWith("/") ? basePath : basePath + "/";
    if (!path.startsWith(bp)) candidates.push(bp + path);
  }

  for (const candidate of candidates) {
    // Check if it's a file
    try {
      await headObject(candidate, bucket, creds);
      if (!candidate.endsWith("/")) {
        res.json({ ok: true, type: "file", key: candidate });
        return;
      }
    } catch {
      // Not a file, continue
    }

    // Check if it's a folder
    const folderPrefix = candidate.endsWith("/") ? candidate : candidate + "/";
    const client = getClient(creds);
    const result = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: folderPrefix, MaxKeys: 1 })
    );
    if ((result.KeyCount || 0) > 0) {
      res.json({ ok: true, type: "folder", prefix: folderPrefix });
      return;
    }
  }

  res.json({ ok: true, type: "not_found" });
});
