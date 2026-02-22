export function createVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.remove();
    };

    video.onloadeddata = () => {
      video.currentTime = 1; // Tenta capturar o frame no segundo 1
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);
          cleanup();
          resolve(thumbnailUrl);
        } else {
          cleanup();
          reject(new Error("Não foi possível obter o contexto do canvas"));
        }
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Erro ao carregar o vídeo para thumbnail"));
    };

    // Timeout de segurança (5 segundos)
    setTimeout(() => {
      cleanup();
      reject(new Error("Timeout ao gerar thumbnail"));
    }, 5000);

    video.load();
  });
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}
