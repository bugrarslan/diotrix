export type StorageKeyPrefix = string;

export interface StorageGetOptions<T> {
	fallback?: T;
	prefix?: StorageKeyPrefix;
}

export interface StorageAdapter {
	setItem<T>(key: string, value: T, prefix?: StorageKeyPrefix): Promise<void>;
	getItem<T>(key: string, options?: StorageGetOptions<T>): Promise<T | null>;
	removeItem(key: string, prefix?: StorageKeyPrefix): Promise<void>;
	clearByPrefix(prefix?: StorageKeyPrefix): Promise<void>;
}
