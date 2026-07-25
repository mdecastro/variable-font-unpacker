"use client";

import { useState } from "react";

type DownloadButtonProps = {
  file: File;
  axisValues: Record<string, number>;
  styleName: string;
};

export default function DownloadButton({
  file,
  axisValues,
  styleName,
}: DownloadButtonProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsExtracting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("axisValues", JSON.stringify(axisValues));
      formData.append("styleName", styleName);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail ?? "No se pudo extraer la instancia.");
      }

      const disposition = response.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] ?? "instance.ttf";

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isExtracting}
        className="w-full rounded-md bg-gradient-to-r from-axis-blue-deep to-axis-magenta-deep px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isExtracting ? "Extrayendo…" : "Descargar instancia estática"}
      </button>
      {error && <p className="mt-2 text-xs text-axis-magenta">{error}</p>}
    </div>
  );
}
