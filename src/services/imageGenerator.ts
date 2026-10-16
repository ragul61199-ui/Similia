import html2canvas from 'html2canvas';

export interface JpegResult {
  dataUrl: string;
  blob: Blob | null;
}

/**
 * Mathematically converts OKLCH color (L, C, H, A) to sRGB string (rgb(...) or rgba(...)).
 * This completely prevents html2canvas from throwing:
 * "Attempting to parse an unsupported color function 'oklch'"
 */
function oklchToRgb(l: number, c: number, h: number, a: number = 1): string {
  // Convert hue degrees to radians
  const hRad = (h * Math.PI) / 180;
  const a_ = c * Math.cos(hRad);
  const b_ = c * Math.sin(hRad);

  // OKLCH -> LMS
  const L = l + 0.3963377774 * a_ + 0.2158037573 * b_;
  const M = l - 0.1055613458 * a_ - 0.0638541728 * b_;
  const S = l - 0.0894841775 * a_ - 1.2914855480 * b_;

  const l_ = L * L * L;
  const m_ = M * M * M;
  const s_ = S * S * S;

  // LMS -> Linear sRGB
  const r = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const b = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

  // Gamma transfer function to standard sRGB
  const gamma = (x: number) => {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const R = Math.round(gamma(r) * 255);
  const G = Math.round(gamma(g) * 255);
  const B = Math.round(gamma(b) * 255);

  if (a < 1) {
    return `rgba(${R}, ${G}, ${B}, ${Number(a.toFixed(3))})`;
  }
  return `rgb(${R}, ${G}, ${B})`;
}

/**
 * Replaces any oklch(...) function in a CSS string with equivalent rgb(...) / rgba(...).
 */
export function replaceOklchColor(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string' || !colorStr.includes('oklch')) {
    return colorStr;
  }

  // Matches oklch(L C H), oklch(L% C H), oklch(L C H / A), oklch(L C H / A%)
  return colorStr.replace(
    /oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/gi,
    (_, lStr, cStr, hStr, aStr) => {
      let l = parseFloat(lStr);
      if (lStr.endsWith('%')) l = l / 100;
      const c = parseFloat(cStr);
      const h = parseFloat(hStr);
      let a = 1;
      if (aStr) {
        a = parseFloat(aStr);
        if (aStr.endsWith('%')) a = a / 100;
      }
      return oklchToRgb(l, c, h, a);
    }
  );
}

/**
 * Captures an HTML element and converts it into a high-resolution JPEG image.
 * Safely converts any oklch colors, prevents text clipping, and fixes baseline offsets.
 */
export async function captureElementAsJpeg(
  element: HTMLElement,
  options?: { quality?: number; scale?: number }
): Promise<JpegResult> {
  const quality = options?.quality ?? 0.95;
  const scale = options?.scale ?? 2; // 2x scale for retina/high-DPI crisp text

  // 1. Await document fonts so metrics and glyph baselines are fully settled
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  // Save original styling
  const originalBackground = element.style.backgroundColor;
  const originalColor = element.style.color;

  // Ensure solid white background during rasterization so JPEG doesn't have black background
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#0f172a';

  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollY: 0,
      scrollX: 0,
      windowWidth: Math.max(element.scrollWidth, 480),
      onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
        // 1. Inject CSS reset in cloned doc:
        // Tailwind's `img { display: block }` causes an invisible line break metric bug in html2canvas
        // that pushes text down and cuts it in half! Setting img { display: inline-block } fixes this.
        const resetStyle = clonedDoc.createElement('style');
        resetStyle.innerHTML = `
          img {
            display: inline-block !important;
            vertical-align: middle !important;
          }
          * {
            -webkit-font-smoothing: antialiased !important;
            text-rendering: auto !important;
          }
        `;
        clonedDoc.head.appendChild(resetStyle);

        // 2. Sanitize all stylesheets in the cloned document so any oklch rules become standard rgb
        const styleNodes = clonedDoc.querySelectorAll('style');
        styleNodes.forEach((s) => {
          if (s.textContent && s.textContent.includes('oklch')) {
            try {
              s.textContent = replaceOklchColor(s.textContent);
            } catch {
              // ignore
            }
          }
        });

        // 3. Inspect every element in the cloned tree:
        // - Prevent text clipping by ensuring text containers have visible overflow and healthy line-height
        // - Convert all computed oklch colors to rgb
        const colorProperties = [
          'color',
          'backgroundColor',
          'borderColor',
          'borderTopColor',
          'borderRightColor',
          'borderBottomColor',
          'borderLeftColor',
          'outlineColor',
          'textDecorationColor',
        ];

        const allCloned = [clonedEl, ...Array.from(clonedEl.querySelectorAll<HTMLElement>('*'))];
        for (const el of allCloned) {
          try {
            const computedStyle = clonedDoc.defaultView?.getComputedStyle(el) || window.getComputedStyle(el);

            // Fix text vertical clipping:
            // Remove overflow: hidden from text blocks so html2canvas doesn't slice glyphs horizontally
            if (el !== clonedEl && (computedStyle.overflow === 'hidden' || computedStyle.overflowX === 'hidden' || computedStyle.overflowY === 'hidden')) {
              el.style.setProperty('overflow', 'visible', 'important');
              el.style.setProperty('overflow-x', 'visible', 'important');
              el.style.setProperty('overflow-y', 'visible', 'important');
            }

            // Ensure proper line-height so descenders (g, y, p, q, j) and accents are never sliced
            const lh = parseFloat(computedStyle.lineHeight);
            const fs = parseFloat(computedStyle.fontSize);
            if (fs > 0 && (!lh || lh < fs * 1.3)) {
              el.style.setProperty('line-height', '1.4', 'important');
            }

            // Convert computed color properties containing oklch
            for (const prop of colorProperties) {
              const val = (computedStyle as any)[prop];
              if (val && typeof val === 'string' && val.includes('oklch')) {
                const safe = replaceOklchColor(val);
                const cssProp = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
                el.style.setProperty(cssProp, safe, 'important');
              }
            }

            // Also check inline style values
            for (const prop of colorProperties) {
              const val = (el.style as any)[prop];
              if (val && typeof val === 'string' && val.includes('oklch')) {
                const safe = replaceOklchColor(val);
                const cssProp = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
                el.style.setProperty(cssProp, safe, 'important');
              }
            }

            // Remove problematic gradients or oklch in background-image
            const bgImg = computedStyle?.backgroundImage || el.style.backgroundImage;
            if (bgImg && (bgImg.includes('gradient') || bgImg.includes('oklch'))) {
              el.style.setProperty('background-image', 'none', 'important');
            }

            // Remove box-shadow containing oklch
            const boxShadow = computedStyle?.boxShadow || el.style.boxShadow;
            if (boxShadow && boxShadow.includes('oklch')) {
              el.style.setProperty('box-shadow', 'none', 'important');
            }
          } catch {
            // ignore
          }
        }
      },
    });

    const dataUrl = canvas.toDataURL('image/jpeg', quality);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
    });

    return { dataUrl, blob };
  } finally {
    element.style.backgroundColor = originalBackground;
    element.style.color = originalColor;
  }
}

/**
 * Downloads the captured HTML element as a JPEG image file.
 */
export async function downloadElementAsJpeg(
  element: HTMLElement,
  filename: string,
  options?: { quality?: number; scale?: number }
): Promise<string> {
  const { dataUrl } = await captureElementAsJpeg(element, options);
  const cleanFilename = filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? filename : `${filename}.jpg`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}

/**
 * Shares the JPEG via native Web Share API (WhatsApp/Files on mobile Android)
 * or downloads the JPEG image file and opens WhatsApp web/app link.
 */
export async function shareOrDownloadJpeg(
  element: HTMLElement,
  filename: string,
  shareData: {
    title: string;
    text: string;
    phone?: string;
    waUrlFallback?: string;
  },
  options?: { quality?: number; scale?: number }
): Promise<void> {
  const { dataUrl, blob } = await captureElementAsJpeg(element, options);
  const cleanFilename = filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? filename : `${filename}.jpg`;

  const file = blob
    ? new File([blob], cleanFilename, { type: 'image/jpeg' })
    : null;

  // Try Native Web Share API with file (supported on Android Chrome, Safari iOS)
  if (navigator.share && file && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.text,
        files: [file],
      });
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled share picker
        return;
      }
      console.warn('Native file share failed, falling back to download and WhatsApp link', err);
    }
  }

  // Fallback: Download the JPEG file so the user has the image
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // If a WhatsApp URL fallback or phone number is provided, open WhatsApp
  if (shareData.waUrlFallback) {
    window.open(shareData.waUrlFallback, '_blank');
  } else if (shareData.phone) {
    const cleanPhone = shareData.phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(
      shareData.text + '\n(Image has been downloaded to your device gallery)'
    )}`;
    window.open(waUrl, '_blank');
  }
}
