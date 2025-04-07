import { browser } from '$app/environment';

export function saveToStorage<T>(key: string, value: T) {
	if (!browser) return false;

	try {
		const serialized = JSON.stringify(value);
		localStorage.setItem(key, serialized);
		return true;
	} catch (error) {
		console.error('保存到本地存儲失敗:', error);
		return false;
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFromStorage(key: string, defaultValue: any = null) {
	if (!browser) return defaultValue;

	try {
		const serialized = localStorage.getItem(key);
		if (serialized === null) return defaultValue;
		return JSON.parse(serialized);
	} catch (error) {
		console.error('從本地存儲獲取失敗:', error);
		return defaultValue;
	}
}

export function removeFromStorage(key: string) {
	if (!browser) return false;

	try {
		localStorage.removeItem(key);
		return true;
	} catch (error) {
		console.error('從本地存儲刪除失敗:', error);
		return false;
	}
}

export function clearStorage() {
	if (!browser) return false;

	try {
		localStorage.clear();
		return true;
	} catch (error) {
		console.error('清空本地存儲失敗:', error);
		return false;
	}
}

export function hasKey(key: string) {
	if (!browser) return false;
	return localStorage.getItem(key) !== null;
}
