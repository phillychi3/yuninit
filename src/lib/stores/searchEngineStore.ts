import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getFromStorage, saveToStorage } from '$lib/utils/storage';

export interface SearchEngine {
	id: string;
	name: string;
	url: string;
	icon: string;
	suggestionUrl: string;
}

export const searchEngines: SearchEngine[] = [
	{
		id: 'google',
		name: 'Google',
		url: 'https://www.google.com/search?q=',
		icon: '🔍',
		suggestionUrl: 'https://suggestqueries.google.com/complete/search?client=firefox&q='
	},
	{
		id: 'bing',
		name: 'Bing',
		url: 'https://www.bing.com/search?q=',
		icon: '🔎',
		suggestionUrl: 'https://api.bing.com/osjson.aspx?query='
	},
	{
		id: 'duckduckgo',
		name: 'DuckDuckGo',
		url: 'https://duckduckgo.com/?q=',
		icon: '🦆',
		suggestionUrl: ''
	},
	{
		id: 'yahoo',
		name: 'Yahoo',
		url: 'https://search.yahoo.com/search?p=',
		icon: '🔱',
		suggestionUrl: 'https://search.yahoo.com/sugg/gossip/gossip-us-ura/?command='
	},
	{
		id: 'baidu',
		name: 'Baidu',
		url: 'https://www.baidu.com/s?wd=',
		icon: '🔵',
		suggestionUrl: 'https://suggestion.baidu.com/su?wd='
	}
];

interface SearchEngineStore {
	subscribe: Writable<string>['subscribe'];
	setEngine: (engineId: string) => void;
	getEngineConfig: () => SearchEngine;
	search: (query: string) => void;
}

const createSearchEngineStore = (): SearchEngineStore => {
	const initialEngine = browser ? getFromStorage('searchEngine', 'google') : 'google';

	const { subscribe, set } = writable<string>(initialEngine);

	return {
		subscribe,

		setEngine: (engineId: string) => {
			set(engineId);
			if (browser) {
				saveToStorage('searchEngine', engineId);
			}
		},

		getEngineConfig: () => {
			let currentEngineId: string;
			subscribe((value) => {
				currentEngineId = value;
			})();

			return searchEngines.find((engine) => engine.id === currentEngineId) || searchEngines[0];
		},

		search: (query: string) => {
			if (!browser || !query) return;

			let currentEngineId: string;
			subscribe((value) => {
				currentEngineId = value;
			})();

			const engine =
				searchEngines.find((engine) => engine.id === currentEngineId) || searchEngines[0];
			const searchUrl = `${engine.url}${encodeURIComponent(query)}`;

			const openInNewTab = getFromStorage('openLinksInNewTab', true);
			if (openInNewTab) {
				window.open(searchUrl, '_blank');
			} else {
				window.location.href = searchUrl;
			}
		}
	};
};

export const searchEngineStore = createSearchEngineStore();
