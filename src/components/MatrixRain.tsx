'use client';

import { useEffect, useRef } from 'react';
import { Noto_Sans_JP } from 'next/font/google';

// Includes half-width katakana without relying on installed system fonts.
const matrixFont = Noto_Sans_JP({ weight: '400', preload: false, adjustFontFallback: false });

// Matrix rain background, after https://didit.chalmers.it
const CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
const FONT_SIZE = 20;
const FRAME_MS = 33; // ~30 fps

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

    // Canvas does not wait for web fonts. Use digits until the katakana font
    // is ready, and keep that fallback if the font cannot be loaded.
    const loadedFont = `${FONT_SIZE}px ${matrixFont.style.fontFamily}`;
    void document.fonts.load(loadedFont, CHARS).then((faces) => {
      if (disposed || faces.length === 0) return;
      chars = CHARS;
      font = loadedFont;
      ctx.font = font;
    }).catch(() => {
      // The digit-only rain remains usable if a font request fails.
    });

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
        ctx.fillText(chars[(Math.random() * chars.length) | 0], i * FONT_SIZE, drops[i] * FONT_SIZE);

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
