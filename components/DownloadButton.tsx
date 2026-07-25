"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorKey, setErrorKey] = useState<
    "extractFailed" | "unexpectedError" | null
  >(null);

  const handleDownload = async () => {
    setIsExtracting(true);
    setErrorKey(null);

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
        setErrorKey("extractFailed");
        return;
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
    } catch {
      setErrorKey("unexpectedError");
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
        {isExtracting ? t.downloading : t.download}
      </button>
      {errorKey && (
        <p className="mt-2 text-xs text-axis-magenta">{t[errorKey]}</p>
      )}
    </div>
  );
}
