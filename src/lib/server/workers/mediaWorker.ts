import { type Job } from "bullmq";
import sharp from "sharp";
import { getObjectStream, getPublicURL, streamToBuffer, uploadObject } from "../s3";
import type { Readable } from "stream";
import prisma from "@/lib/prisma";

export const processImage = async (job: Job) => {
  const { postId, fileKey }: { postId: string; fileKey: string } = job.data;

  const body = await getObjectStream(fileKey);
  if (!body) throw new Error(`Não foi possível ler o arquivo: ${fileKey}`);
  
  const inputBuffer = await streamToBuffer(body as Readable);

  // 1. Proteção contra Decompression Bomb: Verifica metadados antes de processar
  const metadata = await sharp(inputBuffer).metadata();
  const MAX_PIXELS = 8192 * 8192; // Limite de ~67 megapixels

  if (!metadata.width || !metadata.height || (metadata.width * metadata.height) > MAX_PIXELS) {
    throw new Error(`Imagem muito grande ou inválida: ${metadata.width}x${metadata.height}`);
  }

  // Processa imagem principal com limite explícito de pixels
  const processedBuffer = await sharp(inputBuffer, { limitInputPixels: MAX_PIXELS })
    .resize(720, 1280, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  // Processa thumbnail
  const thumbBuffer = await sharp(inputBuffer)
    .resize(240, 420, { fit: "cover" })
    .webp({ quality: 70 })
    .toBuffer();

  const processedKey = fileKey.replace(/\.[^.]+$/, ".webp");
  const thumbKey = fileKey.replace(/\.[^.]+$/, "-thumb.webp");

  // Verifica se o post ainda existe antes de atualizar
  const id = BigInt(postId);
  const postExists = await prisma.post.findUnique({ where: { id } });

  if (!postExists) {
    throw new Error(`Post com ID ${postId} não encontrado no banco de dados. Abortando job.`);
  }

  // Upload usando o helper padronizado (com cache imutável)
  await Promise.all([
    uploadObject({
      key: processedKey,
      body: processedBuffer,
      contentType: "image/webp"
    }),
    uploadObject({
      key: thumbKey,
      body: thumbBuffer,
      contentType: "image/webp"
    })
  ]);

  await prisma.post.update({
    where: { id: BigInt(postId) },
    data: {
      status: "pending", // Pronto para auditoria
      mediaUrl: getPublicURL(processedKey),
      thumbUrl: getPublicURL(thumbKey),
      mimeType: "image/webp",
    },
  });
};
