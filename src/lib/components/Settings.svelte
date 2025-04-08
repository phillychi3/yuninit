<script lang="ts">
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import { saveToStorage, getFromStorage } from '$lib/utils/storage';

	let showSettings = false;
	let settings = {
		theme: 'light',
		openLinksInNewTab: true,
		maxLinksPerRow: 5
	};

	onMount(() => {
		const savedSettings = getFromStorage('userSettings');
		if (savedSettings) {
			settings = { ...settings, ...savedSettings };
		}
		applyTheme(settings.theme);
	});

	function saveSettings() {
		saveToStorage('userSettings', settings);
		applyTheme(settings.theme);
		showSettings = false;
	}

	function applyTheme(theme: string) {
		if (
			theme === 'dark' ||
			(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.toggle('dark', true);
		} else {
			document.documentElement.classList.toggle('dark', false);
		}
	}

	function resetSettings() {
		if (confirm('確定要重置所有設置嗎？這將恢復默認設置。')) {
			settings = {
				theme: 'light',
				openLinksInNewTab: true,
				maxLinksPerRow: 5
			};
			saveSettings();
		}
	}
</script>

<div>
	<button
		on:click={() => (showSettings = true)}
		class="fixed right-6 bottom-6 rounded-full bg-white p-3 shadow-lg transition-shadow hover:shadow-xl"
		aria-label="設置"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 text-gray-600"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
			/>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		</svg>
	</button>

	{#if showSettings}
		<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
			<div
				class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800"
			>
				<div class="p-6">
					<div class="mb-6 flex items-center justify-between">
						<h2 class="text-xl font-bold dark:text-white">設置</h2>
						<button
							on:click={() => (showSettings = false)}
							class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							aria-label="關閉設置"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<form on:submit|preventDefault={saveSettings} class="space-y-6">
						<div>
							<label
								for="theme"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">主題</label
							>
							<select
								id="theme"
								bind:value={settings.theme}
								class="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							>
								<option value="light">淺色</option>
								<option value="dark">深色</option>
								<option value="system">跟隨系統</option>
							</select>
						</div>

						<div class="flex items-center">
							<input
								type="checkbox"
								id="openLinksInNewTab"
								bind:checked={settings.openLinksInNewTab}
								class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<label
								for="openLinksInNewTab"
								class="ml-2 block text-sm text-gray-700 dark:text-gray-200"
							>
								在新標籤頁中打開鏈接
							</label>
						</div>

						<div>
							<label
								for="maxLinksPerRow"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
							>
								每行最多顯示連結數量 ({settings.maxLinksPerRow})
							</label>
							<input
								type="range"
								id="maxLinksPerRow"
								bind:value={settings.maxLinksPerRow}
								min="3"
								max="8"
								step="1"
								class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
							/>
						</div>

						<div class="flex justify-between pt-4">
							<Button variant="outline" on:click={resetSettings} type="button">重置設置</Button>

							<Button variant="primary" type="submit">儲存設置</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>
