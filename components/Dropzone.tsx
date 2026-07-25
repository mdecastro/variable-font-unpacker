"use client";

import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

const ACCEPTED_EXTENSIONS = [".ttf", ".otf"];

type DropzoneProps = {
  onFileAccepted: (file: File) => void;
};

function isVariableFontFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension));
}

export default function Dropzone({ onFileAccepted }: DropzoneProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!isVariableFontFile(file)) {
        setHasError(true);
        return;
      }
      setHasError(false);
      onFileAccepted(file);
    },
    [onFileAccepted],
  );

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFile(event.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
        isDragging
          ? "border-axis-teal bg-axis-teal/10"
          : "border-white/20 hover:border-axis-blue/60"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".ttf,.otf"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <p className="font-medium text-paper">{t.dropzoneCta}</p>
      <p className="mt-1 font-mono text-xs text-paper/50">
        {t.dropzoneFormats}
      </p>
      {hasError && (
        <p className="mt-2 text-xs text-axis-magenta">{t.dropzoneWrongType}</p>
      )}
    </div>
  );
}
