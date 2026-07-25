export type FontAxis = {
  tag: string;
  name: string;
  minValue: number;
  defaultValue: number;
  maxValue: number;
};

export type NamedInstance = {
  name: string;
  coordinates: Record<string, number>;
};

export type FontInfo = {
  familyName: string;
  styleName: string;
  axes: FontAxis[];
  namedInstances: NamedInstance[];
};
