import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "$env/dynamic/private";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type Readable } from "stream";
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream, readdirSync, statSync } from "fs";
import path from "path";

export const bucketName = env.S3_BUCKET_NAME;
export const cdnUrl = env.S3_CDN_URL || "https://media.buero.fun";

/**
 * Cliente S3 configurado dinamicamente com variáveis estáticas.
 */
export const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT ?? "",
  region: env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY ?? "",
    secretAccessKey: env.S3_SECRET_KEY ?? "",
  },
  forcePathStyle: true,
});

/**
 * Converte um Stream do Node em Buffer.
 */
export const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

/**
 * Determina o tipo MIME baseado na extensão do arquivo.
 */
export const resolveContentType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".m3u8": "application/vnd.apple.mpegurl",
    ".ts": "video/mp2t",
    ".mp4": "video/mp4",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".png": "image/png",
    ".gif": "image/gif",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

/**
 * Upload genérico para o S3 com metadados padronizados.
 */
export const uploadObject = async (params: {
  key: string;
  body: Buffer | string | Readable;
  contentType?: string;
  isImmutable?: boolean;
}) => {
  const { key, body, contentType, isImmutable = true } = params;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType || resolveContentType(key),
      ContentDisposition: "inline",
      CacheControl: isImmutable
        ? "public, max-age=31536000, immutable"
        : "no-cache, no-store, must-revalidate",
    }),
  );

  return key;
};

/**
 * Upload de um arquivo local para o S3.
 */
export const uploadFileToS3 = async (
  localPath: string,
  s3Key: string,
  contentType?: string,
) => {
  return uploadObject({
    key: s3Key,
    body: createReadStream(localPath),
    contentType: contentType || resolveContentType(localPath),
  });
};

/**
 * Upload recursivo de um diretório.
 */
export const uploadDirToS3 = async (localDir: string, s3Prefix: string) => {
  const entries = readdirSync(localDir, { recursive: true, encoding: "utf-8" });

  await Promise.all(
    entries.map(async (entry) => {
      const localPath = path.join(localDir, entry);
      if (statSync(localPath).isDirectory()) return;

      const s3Key = `${s3Prefix}/${entry}`;
      await uploadFileToS3(localPath, s3Key);
    }),
  );
};

/**
 * Download de um objeto do S3 para o sistema de arquivos local.
 */
export const downloadFromS3 = async (key: string, destPath: string) => {
  const stream = await getObjectStream(key);
  if (!stream) throw new Error(`Falha ao obter stream para: ${key}`);
  await pipeline(stream as Readable, createWriteStream(destPath));
};

/**
 * Gera uma URL pública para acessar um arquivo no CDN.
 */
export const getPublicURL = (key: string) => {
  return `${cdnUrl}/${key}`;
};

/**
 * Gera uma URL assinada temporária para download.
 */
export const getSignedDownloadURL = async (key: string, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Obtém o stream de um arquivo do S3.
 */
export const getObjectStream = async (key: string) => {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
  return response.Body;
};

/**
 * Move um objeto dentro do S3.
 */
export const moveObject = async (
  sourceKey: string,
  destinationKey: string,
  contentType?: string,
) => {
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${sourceKey}`,
      Key: destinationKey,
      ContentType: contentType || resolveContentType(destinationKey),
      ContentDisposition: "inline",
      CacheControl: "public, max-age=31536000, immutable",
      MetadataDirective: "REPLACE",
    }),
  );
  await deleteObject(sourceKey);

  return destinationKey;
};

/**
 * Deleta um arquivo individual.
 */
export const deleteObject = async (key: string) => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
};

/**
 * Deleta múltiplos arquivos.
 */
export const deleteObjects = async (keys: string[]) => {
  if (keys.length === 0) return;

  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: true,
      },
    }),
  );
};

/**
 * Deleta todos os arquivos com um prefixo.
 */
export const deletePrefix = async (prefix: string) => {
  const listed = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    }),
  );

  const keys = listed.Contents?.map((obj) => obj.Key!).filter(Boolean) ?? [];
  await deleteObjects(keys);
};
