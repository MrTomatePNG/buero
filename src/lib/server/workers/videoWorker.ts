import { type Job } from "bullmq";
import path from "path";
import os from "os";
import fs from "fs";
import { downloadFromS3, uploadDirToS3, uploadFileToS3, cdnUrl } from "../s3";
import { convertToHLS, extractThumbnail } from "@/lib/utils/processor";
import prisma from "@/lib/prisma";
import ffmpeg from "fluent-ffmpeg";

export const processVideo = async (job: Job) => {
  const { postId, fileKey } = job.data;
  
  const tmpDir = path.join(os.tmpdir(), `job-${job.id}`);
  const inputPath = path.join(tmpDir, "input.mp4");
  const thumbPath = path.join(tmpDir, "thumb.jpg");
  const hlsDir = path.join(tmpDir, "hls");
  
  fs.mkdirSync(hlsDir, { recursive: true });

  try {
    // 1. Download
    await downloadFromS3(fileKey, inputPath);
    await job.updateProgress(10);

    // 2. Proteção: Verifica metadados do vídeo (ffprobe)
    const metadata = await new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, data) => (err ? reject(err) : resolve(data)));
    });

    const format = metadata.format;
    const stream = metadata.streams.find((s) => s.codec_type === "video");

    if (!format || !stream || !format.duration) {
      throw new Error("Vídeo inválido ou sem stream de vídeo.");
    }

    // Limites: 10 minutos e resolução 4K
    const MAX_DURATION = 600; // 10 minutos
    const MAX_WIDTH = 4000;
    const MAX_HEIGHT = 4000;

    if (format.duration > MAX_DURATION) {
      throw new Error(`Vídeo muito longo: ${Math.round(format.duration)}s (Máximo: ${MAX_DURATION}s)`);
    }

    if ((stream.width || 0) > MAX_WIDTH || (stream.height || 0) > MAX_HEIGHT) {
      throw new Error(`Resolução não suportada: ${stream.width}x${stream.height}`);
    }

    await job.updateProgress(20);

    // 3. Extrai thumbnail
    await extractThumbnail(inputPath, thumbPath);
    await job.updateProgress(35);

    // 3. Converte pra HLS
    await convertToHLS({
      inputPath,
      outputDir: hlsDir,
      qualities: ["360p", "720p"],
    });
    await job.updateProgress(80);

    const baseKey = fileKey.replace("uploads/pending/", "uploads/pending/hls-");
    const thumbKey = fileKey.replace(/\.[^.]+$/, "-thumb.jpg");

    // Verifica existência antes de atualizar
    const id = BigInt(postId);
    const postExists = await prisma.post.findUnique({ where: { id } });
    if (!postExists) throw new Error(`Post ${postId} sumiu do banco.`);

    // 4. Upload dos segmentos
    await uploadDirToS3(hlsDir, baseKey);
    await uploadFileToS3(thumbPath, thumbKey, "image/jpeg");
    await job.updateProgress(95);

    // 5. Update DB
    await prisma.post.update({
      where: { id: BigInt(postId) },
      data: {
        status: "pending",
        mediaUrl: `${cdnUrl}/${baseKey}/master.m3u8`,
        thumbUrl: `${cdnUrl}/${thumbKey}`,
        mimeType: "application/vnd.apple.mpegurl",
      },
    });
  } finally {
    // Cleanup local temp files
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};
