export interface Device {
  deviceId: string;
  name: string;
  manufacturer: string;
  type: string;
  os: string;
  osVersion: string;
  processor: string;
  ram: number | null;
  description: string;
}

export interface DeviceCreate {
  name: string;
  manufacturer?: string;
  type: string;
  os?: string;
  osVersion?: string;
  processor?: string;
  ram?: number | null;
  description?: string;
}
