const OUTPUT_WIDTH = 1280;
const ASPECT_RATIO = 4 / 3;

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

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 3;

  lines.forEach((line, index) => {
    const size = index === 0 ? Math.round(base * 1.2) : base;
    ctx.font = `${index === 0 ? 700 : 500} ${size}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
    ctx.fillText(
      truncate(ctx, line, width - padding * 2),
      width / 2,
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

export function videoToWatermarked(video: HTMLVideoElement, lines: string[]) {
  const srcWidth = video.videoWidth;
  const srcHeight = video.videoHeight;

  // Potong bagian tengah ke rasio 4:3 supaya sama dengan yang terlihat di layar
  let cropWidth = srcWidth;
  let cropHeight = srcHeight;
  if (srcWidth / srcHeight > ASPECT_RATIO) {
    cropWidth = srcHeight * ASPECT_RATIO;
  } else {
    cropHeight = srcWidth / ASPECT_RATIO;
  }
  const cropX = (srcWidth - cropWidth) / 2;
  const cropY = (srcHeight - cropHeight) / 2;

  const width = Math.min(OUTPUT_WIDTH, Math.round(cropWidth));
  const height = Math.round(width / ASPECT_RATIO);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak didukung');

  ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
  drawWatermark(ctx, width, height, lines);
  return canvasToFile(canvas);
}