"use client";

import { useCallback, useRef, useState } from "react";

const ACCEPTED_EXTENSIONS = [".ttf", ".otf"];

type DropzoneProps = {
  onFileAccepted: (file: File) => void;
};

function isVariableFontFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension));
}

export default function Dropzone({ onFileAccepted }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!isVariableFontFile(file)) {
        setError("Subí un archivo .ttf o .otf.");
        return;
      }
      setError(null);
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
      <p className="font-medium text-paper">
        Arrastrá una fuente variable acá, o hacé click para elegir un archivo
      </p>
      <p className="mt-1 font-mono text-xs text-paper/50">
        Formatos soportados: .ttf, .otf
      </p>
      {error && <p className="mt-2 text-xs text-axis-magenta">{error}</p>}
    </div>
  );
}
