// Shapes returned by the simulator websocket API (see FORK.md).

export interface Sample {
  t: string; // local ISO timestamp
  minute: number; // minutes since local midnight (0..1380/1440/1500 on DST days)
  brightness_pct: number;
  color_temp_kelvin: number;
  rgb_color: [number, number, number];
  sun_position: number;
  force_rgb_color: boolean;
}

export interface Curve {
  date: string;
  sun: Record<string, string>;
  samples: Sample[];
}

export interface LightInfo {
  entity_id: string;
  name?: string;
  state?: string;
  missing?: boolean;
  features?: string[];
  supported_color_modes?: string[];
  min_color_temp_kelvin?: number | null;
  max_color_temp_kelvin?: number | null;
}

export interface Profile {
  entry_id: string;
  title: string;
  loaded: boolean;
  options: Record<string, unknown>;
  stored_options: Record<string, unknown>;
  error: string | null;
  lights: LightInfo[];
  switches: string[];
}

export interface PerLight {
  brightness?: number;
  color_temp_kelvin?: number;
  rgb_color?: [number, number, number];
  transition?: number;
  display_rgb?: [number, number, number] | null;
  error?: string;
}

export interface Point {
  t: string;
  settings: Omit<Sample, "t" | "minute">;
  per_light: Record<string, PerLight>;
}

export type Errors = Record<string, string>;
