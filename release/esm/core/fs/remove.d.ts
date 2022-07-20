import type { FileSystem } from '../types.js';
export declare function remove(fs: FileSystem, target: string): Promise<void>;
export declare function removeSync(fs: FileSystem, target: string): void;
