"use client";

import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import FontPreview from "@/components/FontPreview";
import InstanceList from "@/components/InstanceList";
import DownloadButton from "@/components/DownloadButton";
import type { FontInfo, NamedInstance } from "@/components/types";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fontInfo, setFontInfo] = useState<FontInfo | null>(null);
  const [axisValues, setAxisValues] = useState<Record<string, number>>({});
  const [selectedInstanceName, setSelectedInstanceName] = useState<string | null>(
    null,
  );
  const [isInspecting, setIsInspecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileAccepted = async (nextFile: File) => {
    setIsInspecting(true);
    setError(null);
    setFontInfo(null);

    try {
      const formData = new FormData();
      formData.append("file", nextFile);

      const response = await fetch("/api/inspect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? "No se pudo inspeccionar la fuente.");
      }

      const info = data as FontInfo;
      setFile(nextFile);
      setFontInfo(info);
      setSelectedInstanceName(null);
      setAxisValues(
        Object.fromEntries(info.axes.map((axis) => [axis.tag, axis.defaultValue])),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsInspecting(false);
    }
  };

  const handleSelectInstance = (instance: NamedInstance | null) => {
    setSelectedInstanceName(instance?.name ?? null);
    if (instance) {
      setAxisValues((current) => ({ ...current, ...instance.coordinates }));
    }
  };

  const handleAxisValueChange = (tag: string, value: number) => {
    setAxisValues((current) => ({ ...current, [tag]: value }));
  };

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16 md:px-10 lg:py-24">
      <div className="w-full max-w-[1400px] space-y-12">
        <header className="w-full text-center lg:text-left">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-axis-teal">
            TTF · OTF · fvar
          </p>
          <h1 className="hero-title gradient-text mt-3 font-display text-6xl leading-[0.95] tracking-tight uppercase sm:text-7xl lg:text-8xl">
            Variable Font
            <br />
            Unpacker
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-paper/70 lg:mx-0 lg:text-lg">
            Subí una fuente variable, movés sus ejes en vivo y descargás la
            instancia estática exacta que necesitás.
          </p>
        </header>

        <Dropzone onFileAccepted={handleFileAccepted} />

        {isInspecting && (
          <p className="text-center font-mono text-sm text-paper/60">
            Inspeccionando fuente…
          </p>
        )}

        {error && (
          <p className="text-center text-sm text-axis-magenta">{error}</p>
        )}

        {file && fontInfo && (
          <div className="grid w-full items-start gap-8 lg:grid-cols-5">
            <div className="lg:sticky lg:top-8 lg:col-span-3">
              <FontPreview
                key={`${file.name}-${file.size}-${file.lastModified}`}
                file={file}
                familyName={fontInfo.familyName}
                axes={fontInfo.axes}
                axisValues={axisValues}
              />
            </div>

            <div className="space-y-6 rounded-2xl border border-white/10 bg-ink-2/60 p-6 backdrop-blur lg:col-span-2">
              <InstanceList
                axes={fontInfo.axes}
                namedInstances={fontInfo.namedInstances}
                axisValues={axisValues}
                selectedInstanceName={selectedInstanceName}
                onSelectInstance={handleSelectInstance}
                onAxisValueChange={handleAxisValueChange}
              />

              <DownloadButton
                file={file}
                axisValues={axisValues}
                styleName={selectedInstanceName ?? "Custom"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
