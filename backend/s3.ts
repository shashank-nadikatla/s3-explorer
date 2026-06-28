import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import type { S3Client as S3ClientType } from "@aws-sdk/client-s3";

export interface Creds {
  access_key: string;
  secret_key: string;
  region: string;
}

export function getClient(creds: Creds): S3ClientType {
  return new S3Client({
    region: creds.region,
    credentials: {
      accessKeyId: creds.access_key,
      secretAccessKey: creds.secret_key,
    },
  });
}

export interface ListResult {
  folders: string[];
  files: Array<{
    key: string;
    name: string;
    size: number;
    last_modified: string;
  }>;
}

export async function listPrefix(
  prefix: string,
  bucket: string,
  creds: Creds
): Promise<ListResult> {
  const client = getClient(creds);
  const folders: string[] = [];
  const files: ListResult["files"] = [];

  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: "/",
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);

    for (const cp of response.CommonPrefixes || []) {
      if (cp.Prefix) folders.push(cp.Prefix);
    }

    for (const obj of response.Contents || []) {
      if (obj.Key === prefix) continue; // skip the prefix itself
      const name = obj.Key!.split("/").pop() || obj.Key!;
      files.push({
        key: obj.Key!,
        name,
        size: obj.Size || 0,
        last_modified: obj.LastModified?.toISOString() || "",
      });
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return { folders, files };
}

export async function readObject(key: string, bucket: string, creds: Creds): Promise<string> {
  const client = getClient(creds);
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await client.send(command);
  const body = await response.Body?.transformToString("utf-8");
  return body || "";
}

export async function writeObject(key: string, content: string, bucket: string, creds: Creds) {
  const client = getClient(creds);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: Buffer.from(content, "utf-8"),
  });
  await client.send(command);
}

export async function deleteObject(key: string, bucket: string, creds: Creds) {
  const client = getClient(creds);
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await client.send(command);
}

export async function copyObject(srcKey: string, destKey: string, bucket: string, creds: Creds) {
  const client = getClient(creds);
  const command = new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${srcKey}`,
    Key: destKey,
  });
  await client.send(command);
}

export async function headObject(key: string, bucket: string, creds: Creds) {
  const client = getClient(creds);
  const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
  return client.send(command);
}

export async function getObjectStream(key: string, bucket: string, creds: Creds) {
  const client = getClient(creds);
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return client.send(command);
}

export async function uploadBuffer(key: string, buffer: Buffer, bucket: string, creds: Creds) {
  const client = getClient(creds);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
  });
  await client.send(command);
}
