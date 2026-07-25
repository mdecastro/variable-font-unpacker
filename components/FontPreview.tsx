"use client";

import { useEffect, useState } from "react";
import type { FontAxis } from "./types";

type FontPreviewProps = {
  file: File;
  familyName: string;
  axes: FontAxis[];
  axisValues: Record<string, number>;
};

const PREVIEW_FAMILY = "__font-unpacker-preview__";

export default function FontPreview({
  file,
  familyName,
  axes,
  axisValues,
}: FontPreviewProps) {
  const [text, setText] = useState(
    "The quick brown fox jumps over the lazy dog — 0123456789",
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const objectUrl = URL.createObjectURL(file);
    const fontFace = new FontFace(PREVIEW_FAMILY, `url(${objectUrl})`);

    fontFace
      .load()
      .then((loaded) => {
        if (cancelled) return;
        document.fonts.add(loaded);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
      document.fonts.delete(fontFace);
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const variationSettings = axes
    .map((axis) => `"${axis.tag}" ${axisValues[axis.tag] ?? axis.defaultValue}`)
    .join(", ");

  return (
    <div className="rounded-2xl border border-white/10 bg-paper p-6 text-ink shadow-2xl shadow-black/30">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold tracking-wide text-ink/60 uppercase">
          {familyName}
        </h3>
        <span className="flex items-center gap-1.5 font-mono text-xs text-ink/40">
          <span
            className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-axis-teal" : "bg-axis-amber"}`}
          />
          {ready ? "Fuente cargada" : "Cargando fuente…"}
        </span>
      </div>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm text-ink outline-none focus:border-axis-blue"
        placeholder="Texto de previsualización"
      />
      <p
        style={{
          fontFamily: ready ? PREVIEW_FAMILY : "inherit",
          fontVariationSettings: variationSettings,
          fontSize: "2rem",
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {text}
      </p>
    </div>
  );
}
