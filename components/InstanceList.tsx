"use client";

import type { FontAxis, NamedInstance } from "./types";

type InstanceListProps = {
  axes: FontAxis[];
  namedInstances: NamedInstance[];
  axisValues: Record<string, number>;
  selectedInstanceName: string | null;
  onSelectInstance: (instance: NamedInstance | null) => void;
  onAxisValueChange: (tag: string, value: number) => void;
};

const AXIS_COLORS = [
  "var(--color-axis-blue)",
  "var(--color-axis-magenta)",
  "var(--color-axis-amber)",
  "var(--color-axis-teal)",
];

export default function InstanceList({
  axes,
  namedInstances,
  axisValues,
  selectedInstanceName,
  onSelectInstance,
  onAxisValueChange,
}: InstanceListProps) {
  return (
    <div className="space-y-6">
      {namedInstances.length > 0 && (
        <div>
          <h3 className="mb-2 font-mono text-xs font-semibold tracking-wide text-paper/50 uppercase">
            Instancias con nombre
          </h3>
          <div className="flex flex-wrap gap-2">
            {namedInstances.map((instance) => (
              <button
                key={instance.name}
                onClick={() => onSelectInstance(instance)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedInstanceName === instance.name
                    ? "border-transparent bg-gradient-to-r from-axis-blue to-axis-magenta text-white"
                    : "border-white/15 text-paper/80 hover:border-axis-teal/60"
                }`}
              >
                {instance.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 font-mono text-xs font-semibold tracking-wide text-paper/50 uppercase">
          Ejes de variación
        </h3>
        <div className="space-y-4">
          {axes.map((axis, index) => {
            const accent = AXIS_COLORS[index % AXIS_COLORS.length];
            return (
              <div key={axis.tag}>
                <div className="mb-1 flex items-center justify-between font-mono text-xs text-paper/60">
                  <span>
                    {axis.name} ({axis.tag})
                  </span>
                  <span style={{ color: accent }}>
                    {axisValues[axis.tag] ?? axis.defaultValue}
                  </span>
                </div>
                <input
                  type="range"
                  min={axis.minValue}
                  max={axis.maxValue}
                  step={1}
                  value={axisValues[axis.tag] ?? axis.defaultValue}
                  onChange={(event) => {
                    onSelectInstance(null);
                    onAxisValueChange(axis.tag, Number(event.target.value));
                  }}
                  style={{ accentColor: accent }}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
