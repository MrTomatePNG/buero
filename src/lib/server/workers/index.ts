import { connection } from "../queue";
import { Worker } from "bullmq";
import { processImage } from "./mediaWorker";
import { processVideo } from "./videoWorker";
import { baseLogger } from "../logger";

/**
 * Worker Unificado do Buero.
 * Escuta a fila 'media-processing' e delega para o processador correto.
 */
export const mediaWorker = new Worker(
  "media-processing",
  async (job) => {
    const { mimeType, postId } = job.data;

    baseLogger.info(
      { postId, mimeType, jobId: job.id },
      "Iniciando processamento de mídia",
    );

    try {
      if (mimeType.startsWith("image/")) {
        await processImage(job);
      } else if (
        mimeType.startsWith("video/") ||
        mimeType === "application/x-mpegURL"
      ) {
        await processVideo(job);
      } else {
        baseLogger.warn(
          { mimeType },
          "Tipo de arquivo não suportado pelo worker",
        );
      }
    } catch (error) {
      baseLogger.error(
        { error, postId, jobId: job.id },
        "Erro crítico no worker de mídia",
      );
      throw error; // Re-throw para o BullMQ lidar com retentativas
    }
  },
  {
    connection,
    concurrency: 3, // Permite 3 jobs simultâneos (ideal para misturar imagens rápidas e vídeos lentos)
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
);

mediaWorker.on("completed", (job) => {
  baseLogger.info(
    { jobId: job.id, postId: job.data.postId },
    "Processamento concluído com sucesso",
  );
});

mediaWorker.on("failed", (job, err) => {
  baseLogger.error({ jobId: job?.id, err }, "Job falhou");
});
