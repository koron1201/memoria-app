/**
 * 端末内プロフィール用に画像を軽量 JPEG data URL へ圧縮（localStorage 負荷軽減）
 */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("画像ファイルを選んでください");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("12MB 以下の画像にしてください");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const maxEdge = 512;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("画像の処理に失敗しました");
    ctx.drawImage(bitmap, 0, 0, w, h);
    let q = 0.88;
    let dataUrl = canvas.toDataURL("image/jpeg", q);
    while (dataUrl.length > 1_200_000 && q > 0.5) {
      q -= 0.08;
      dataUrl = canvas.toDataURL("image/jpeg", q);
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}
