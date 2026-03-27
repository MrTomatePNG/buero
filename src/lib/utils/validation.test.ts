import { describe, it, expect } from "vitest";
import { z } from "zod";

// Simulação do esquema que criamos nas rotas
const uploadSchema = z.object({
  comment: z.string().max(500).nullable().transform(v => v || ""),
  media: z.instanceof(File),
});

describe("Segurança - Validação de Input", () => {
  it("deve rejeitar comentários muito longos", () => {
    const longComment = "a".repeat(501);
    const result = uploadSchema.safeParse({
      comment: longComment,
      media: new File([""], "test.jpg", { type: "image/jpeg" }),
    });
    expect(result.success).toBe(false);
  });

  it("deve sanitizar comentários vazios", () => {
    const result = uploadSchema.safeParse({
      comment: null,
      media: new File([""], "test.jpg", { type: "image/jpeg" }),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.comment).toBe("");
    }
  });

  it("deve rejeitar se o arquivo de mídia estiver ausente", () => {
    const result = uploadSchema.safeParse({
      comment: "legal",
      media: null,
    });
    expect(result.success).toBe(false);
  });
});
