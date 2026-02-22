// src/lib/utils/thumbnail.ts
export function createVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.src = url; // ← faltava isso
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 1; // pega o frame no segundo 1 (evita tela preta)

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth; // ← videoWidth, não width
      canvas.height = video.videoHeight; // ← videoHeight, não height

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);

      // limpa a memória
      URL.revokeObjectURL(url);
      video.remove();

      resolve(thumbnailUrl);
    });

    video.addEventListener("error", reject);
    video.load(); // ← faltava isso
  });
}

// converte dataURL em File pra mandar pro backend
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}
