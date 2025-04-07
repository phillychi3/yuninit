import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getFromStorage, saveToStorage } from '$lib/utils/storage';

export const availableTools = [
	{
		id: 'weather',
		name: '天氣',
		description: '顯示當前位置的天氣資訊',
		icon: '🌤️',
		component: 'Weather'
	},
	{
		id: 'clock',
		name: '時鐘',
		description: '顯示當前時間和日期',
		icon: '🕒',
		component: 'Clock'
	}
];

const createToolsStore = () => {
	const defaultActiveTools = ['weather', 'clock'];
	const initialActiveTools = browser
		? getFromStorage('activeTools', defaultActiveTools)
		: defaultActiveTools;

	const { subscribe, set, update } = writable(initialActiveTools);

	return {
		subscribe,

		addTool: (toolId: string) => {
			update((activeTools) => {
				if (activeTools.includes(toolId)) {
					return activeTools;
				}

				const newActiveTools = [...activeTools, toolId];
				if (browser) {
					saveToStorage('activeTools', newActiveTools);
				}
				return newActiveTools;
			});
		},

		removeTool: (toolId: string) => {
			update((activeTools) => {
				const newActiveTools = activeTools.filter((id) => id !== toolId);
				if (browser) {
					saveToStorage('activeTools', newActiveTools);
				}
				return newActiveTools;
			});
		},

		reorderTools: (newOrder) => {
			set(newOrder);
			if (browser) {
				saveToStorage('activeTools', newOrder);
			}
		},

		resetToDefault: () => {
			set(defaultActiveTools);
			if (browser) {
				saveToStorage('activeTools', defaultActiveTools);
			}
		},

		isActive: (toolId: string) => {
			let active = false;
			subscribe((activeTools) => {
				active = activeTools.includes(toolId);
			})();
			return active;
		},

		getToolConfig: (toolId: string) => {
			return availableTools.find((tool) => tool.id === toolId);
		},

		getActiveToolsConfig: () => {
			let activeToolsIds = [];
			subscribe((value) => {
				activeToolsIds = value;
			})();

			return activeToolsIds
				.map((id) => availableTools.find((tool) => tool.id === id))
				.filter(Boolean);
		}
	};
};

export const toolsStore = createToolsStore();
