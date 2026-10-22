'use client';

import { useEffect, useRef } from 'react';
import { Noto_Sans_JP } from 'next/font/google';

// Includes half-width katakana without relying on installed system fonts.
const matrixFont = Noto_Sans_JP({ weight: '400', preload: false, adjustFontFallback: false });

// Matrix rain background, after https://didit.chalmers.it
const CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
const FONT_SIZE = 20;
const FRAME_MS = 33; // ~30 fps

// Draws a green clown face with plain shapes, since a system missing the
// katakana font (e.g. a bare Arch install) is likely missing emoji fonts too
function createGreenClown() {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = FONT_SIZE;
  const ctx = sprite.getContext('2d')!;
  const s = FONT_SIZE / 20;
  const circle = (x: number, y: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x * s, y * s, r * s, 0, Math.PI * 2);
    ctx.fill();
  };

  // Hair tufts, face, eyes and nose
  circle(3.5, 7, 3.5, '#080');
  circle(16.5, 7, 3.5, '#080');
  circle(10, 11, 7, '#0f0');
  circle(7.5, 9, 1.2, '#000');
  circle(12.5, 9, 1.2, '#000');
  circle(10, 12, 2, '#050');

  // Smile
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.arc(10 * s, 13 * s, 3.5 * s, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  return sprite;
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { alpha: false })!;
    let drops: number[] = [];
    let needsResize = true;
    let lastFrame = -Infinity;
    let rafId = 0;
    let disposed = false;
    let chars = '0123456789';
    let font = `${FONT_SIZE}px monospace`;
    let clown: HTMLCanvasElement | null = null;

    // Canvas does not wait for web fonts. Use digits until the katakana font
    // is ready, and rain green clowns instead if the font cannot be loaded.
    const useClowns = () => {
      if (!disposed) clown = createGreenClown();
    };
    const loadedFont = `${FONT_SIZE}px ${matrixFont.style.fontFamily}`;
    void document.fonts.load(loadedFont, CHARS).then((faces) => {
      if (disposed) return;
      if (faces.length === 0) return useClowns();
      chars = CHARS;
      font = loadedFont;
      ctx.font = font;
    }).catch(useClowns);

    // Rendered at CSS pixel size (not devicePixelRatio) to keep the per-frame fill cheap
    const resize = () => {
      needsResize = false;
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Skip height-only shrinks (mobile URL bar), which would otherwise clear the canvas while scrolling
      if (width === canvas.width && height <= canvas.height) return;

      canvas.width = width;
      canvas.height = height;
      // Resizing resets the canvas and its context state
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = font;
      drops = Array.from({ length: Math.ceil(width / FONT_SIZE) }, (_, i) => drops[i] ?? 1);
    };

    const draw = (time: number) => {
      rafId = requestAnimationFrame(draw);
      if (time - lastFrame < FRAME_MS) return;
      lastFrame = time;
      if (needsResize) resize();

      // Translucent black over the last frame leaves fading trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0';
      for (let i = 0; i < drops.length; i++) {
        // Text is drawn from its baseline, so the sprite goes one row up to line up with it
        if (clown) ctx.drawImage(clown, i * FONT_SIZE, (drops[i] - 1) * FONT_SIZE);
        else ctx.fillText(chars[(Math.random() * chars.length) | 0], i * FONT_SIZE, drops[i] * FONT_SIZE);

        // Send the drop back to the top at a random point after it leaves the screen
        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const onResize = () => { needsResize = true; };
    window.addEventListener('resize', onResize);
    rafId = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`${matrixFont.className} fixed left-0 top-0 -z-10 pointer-events-none`} />;
}
