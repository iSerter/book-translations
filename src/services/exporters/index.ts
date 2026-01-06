import { ExportData, ExportOptions } from './types.js';

export interface IExporter {
  export(data: ExportData, options: ExportOptions): Promise<void>;
}

export * from './types.js';
