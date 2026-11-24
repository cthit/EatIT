'use client';

import { useEffect, useRef } from 'react';
import { Noto_Sans_JP } from 'next/font/google';

// Includes half-width katakana without relying on installed system fonts.
const matrixFont = Noto_Sans_JP({ weight: '400', preload: false, adjustFontFallback: false });

// Matrix rain background, after https://didit.chalmers.it
const CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
const FONT_SIZE = 20;
const FRAME_MS = 33; // ~30 fps
const FONT = `${FONT_SIZE}px ${matrixFont.style.fontFamily}`;

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
      ctx.font = FONT;
      const rows = Math.ceil(height / FONT_SIZE);
      drops = Array.from({ length: Math.ceil(width / FONT_SIZE) }, (_, i) => {
        // Stagger fresh columns above the viewport so the rain does not start
        // as one horizontal line dropping in lockstep.
        return drops[i] ?? -Math.random() * rows;
      });
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
        ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], i * FONT_SIZE, drops[i] * FONT_SIZE);

        // Send the drop back to the top at a random point after it leaves the screen
        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    // Canvas draws with whatever font is already available, so wait for the
    // self-hosted katakana font before starting (it is bundled, so this is quick).
    const start = () => {
      if (disposed) return;
      ctx.font = FONT;
      rafId = requestAnimationFrame(draw);
    };
    void document.fonts.load(FONT, CHARS).catch(() => {}).then(start);

    const onResize = () => { needsResize = true; };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`${matrixFont.className} fixed left-0 top-0 -z-10 pointer-events-none`} />;
}
