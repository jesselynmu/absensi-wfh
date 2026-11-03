const MAX_WIDTH = 1280;

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 0 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, lines: string[]) {
  const base = Math.max(14, Math.round(width / 42));
  const padding = Math.round(base * 0.9);
  const lineHeight = Math.round(base * 1.4);
  const blockHeight = lines.length * lineHeight + padding * 2;

  // Gradasi gelap supaya teks tetap terbaca di foto yang terang
  const gradientTop = height - blockHeight * 1.5;
  const gradient = ctx.createLinearGradient(0, gradientTop, 0, height);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.35, 'rgba(0,0,0,0.55)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, gradientTop, width, height - gradientTop);

  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 3;

  lines.forEach((line, index) => {
    const size = index === 0 ? Math.round(base * 1.2) : base;
    ctx.font = `${index === 0 ? 700 : 500} ${size}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
    ctx.fillText(
      truncate(ctx, line, width - padding * 2),
      padding,
      height - blockHeight + padding + index * lineHeight,
    );
  });
  ctx.shadowBlur = 0;
}

function canvasToFile(canvas: HTMLCanvasElement): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(new File([blob], `absensi-${Date.now()}.jpg`, { type: 'image/jpeg' }))
          : reject(new Error('Gagal membuat gambar')),
      'image/jpeg',
      0.85,
    );
  });
}

function render(source: CanvasImageSource, srcWidth: number, srcHeight: number, lines: string[]) {
  const scale = Math.min(1, MAX_WIDTH / srcWidth);
  const width = Math.round(srcWidth * scale);
  const height = Math.round(srcHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak didukung');

  ctx.drawImage(source, 0, 0, width, height);
  drawWatermark(ctx, width, height, lines);
  return canvasToFile(canvas);
}

export const videoToWatermarked = (video: HTMLVideoElement, lines: string[]) =>
  render(video, video.videoWidth, video.videoHeight, lines);

export async function imageFileToWatermarked(file: File, lines: string[]) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    return await render(bitmap, bitmap.width, bitmap.height, lines);
  } finally {
    bitmap.close();
  }
}