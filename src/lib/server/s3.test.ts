import { describe, it, expect } from "vitest";
import { resolveContentType, getPublicURL } from "$lib/server/s3";

describe("S3 Utils", () => {
  it("deve resolver tipos MIME corretamente", () => {
    expect(resolveContentType("image.jpg")).toBe("image/jpeg");
    expect(resolveContentType("video.mp4")).toBe("video/mp4");
    expect(resolveContentType("playlist.m3u8")).toBe("application/vnd.apple.mpegurl");
    expect(resolveContentType("unknown.dat")).toBe("application/octet-stream");
  });

  it("deve gerar URLs públicas do CDN corretamente", () => {
    const key = "uploads/test.jpg";
    const url = getPublicURL(key);
    expect(url).toContain("buero.fun");
    expect(url).toContain(key);
  });
});
