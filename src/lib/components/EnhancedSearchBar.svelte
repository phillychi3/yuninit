<script lang="ts">
	import { onMount } from 'svelte';
	import {
		searchEngineStore,
		searchEngines,
		type SearchEngine
	} from '$lib/stores/searchEngineStore';
	import { getFromStorage } from '$lib/utils/storage';

	type Suggestion = string;

	let searchQuery = '';
	let suggestions: Suggestion[] = [];
	let showSuggestions = false;
	let selectedIndex = -1;
	let suggestionsEnabled = true;
	let searchBarRef: HTMLInputElement;
	let searchEngineDropdownOpen = false;
	let suggestionTimer: ReturnType<typeof setTimeout>;

	function selectSuggestion(index: number): void {
		if (index >= 0 && index < suggestions.length) {
			searchQuery = suggestions[index];
			showSuggestions = false;
			selectedIndex = -1;
		}
	}

	function selectSearchEngine(engineId: string): void {
		searchEngineStore.setEngine(engineId);
		searchEngineDropdownOpen = false;

		if (searchBarRef) {
			searchBarRef.focus();
		}
	}

	function handleSubmit(): void {
		if (searchQuery.trim()) {
			const isUrl = isValidUrl(searchQuery);

			if (isUrl) {
				const url =
					searchQuery.startsWith('http://') || searchQuery.startsWith('https://')
						? searchQuery
						: `https://${searchQuery}`;

				const openInNewTab = getFromStorage('openLinksInNewTab', true);
				if (openInNewTab) {
					window.open(url, '_blank');
				} else {
					window.location.href = url;
				}
			} else {
				searchEngineStore.search(searchQuery);
			}
			searchQuery = '';
			showSuggestions = false;
			selectedIndex = -1;
		}
	}

	function isValidUrl(string: string): boolean {
		try {
			new URL(string);
			return true;
		} catch (_) {
			if (
				/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(
					string
				)
			) {
				return true;
			}
			return false;
		}
	}

	async function fetchSuggestions(): Promise<void> {
		if (!searchQuery.trim() || !suggestionsEnabled) {
			suggestions = [];
			showSuggestions = false;
			return;
		}

		//TODO: 編寫api
		suggestions = [];
		showSuggestions = false;
		return;

		try {
			if (searchQuery.length > 0) {
				const mockSuggestions: Suggestion[] = [`${searchQuery} 教學`];

				suggestions = mockSuggestions;
				showSuggestions = suggestions.length > 0;
			} else {
				suggestions = [];
				showSuggestions = false;
			}
		} catch (error) {
			console.error('獲取建議時出錯:', error);
			suggestions = [];
			showSuggestions = false;
		}
	}
	function handleSearchInput(): void {
		selectedIndex = -1;

		clearTimeout(suggestionTimer);
		suggestionTimer = setTimeout(fetchSuggestions, 300);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (showSuggestions) {
			switch (event.key) {
				case 'ArrowDown':
					event.preventDefault();
					selectedIndex = (selectedIndex + 1) % suggestions.length;
					break;
				case 'ArrowUp':
					event.preventDefault();
					selectedIndex = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1;
					break;
				case 'Enter':
					if (selectedIndex >= 0) {
						event.preventDefault();
						selectSuggestion(selectedIndex);
						handleSubmit();
					}
					break;
				case 'Escape':
					event.preventDefault();
					showSuggestions = false;
					break;
			}
		} else if (event.key === 'Escape' && searchEngineDropdownOpen) {
			event.preventDefault();
			searchEngineDropdownOpen = false;
		}
	}

	function handleClickOutside(event: MouseEvent): void {
		if (!event.target) return;
		const target = event.target as Element;
		if (searchEngineDropdownOpen && !target.closest('.search-engine-dropdown')) {
			searchEngineDropdownOpen = false;
		}

		if (showSuggestions && !target.closest('.search-suggestions')) {
			showSuggestions = false;
		}
	}

	onMount(() => {
		suggestionsEnabled = getFromStorage('suggestionsEnabled', true);
		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	$: currentEngine =
		searchEngines.find((engine) => engine.id === $searchEngineStore) || searchEngines[0];
</script>

<div class="mx-auto w-full max-w-2xl">
	<form
		on:submit|preventDefault={handleSubmit}
		class="search-form relative flex flex-col items-center"
	>
		<div class="relative w-full">
			<div
				class="search-engine-dropdown absolute top-1/2 left-4 flex -translate-y-1/2 transform items-center"
			>
				<button
					type="button"
					on:click|stopPropagation={() => (searchEngineDropdownOpen = !searchEngineDropdownOpen)}
					class="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none dark:text-gray-300 dark:hover:text-gray-100"
					aria-label="選擇搜索引擎"
				>
					<span class="mr-1 text-xl">
						<img src={currentEngine.icon} alt={currentEngine.name} class="h-5 w-5" loading="lazy" />
					</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>

				{#if searchEngineDropdownOpen}
					<div
						class="absolute top-full left-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg dark:bg-gray-800"
					>
						{#each searchEngines as engine}
							<button
								type="button"
								on:click={() => selectSearchEngine(engine.id)}
								class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
							>
								<span class="mr-2 text-xl">
									<img src={engine.icon} alt={engine.name} class="h-5 w-5" loading="lazy" />
								</span>
								<span>{engine.name}</span>
								{#if engine.id === currentEngine.id}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="ml-auto h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<input
				type="text"
				bind:value={searchQuery}
				bind:this={searchBarRef}
				on:input={handleSearchInput}
				on:keydown={handleKeydown}
				on:focus={() => {
					if (searchQuery && suggestionsEnabled) {
						fetchSuggestions();
					}
				}}
				placeholder="搜尋或輸入網址"
				class="w-full rounded-full border border-gray-300 py-4 pr-12 pl-16 text-lg shadow-md focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			/>

			{#if searchQuery}
				<button
					type="button"
					class="absolute top-1/2 right-16 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					on:click={() => {
						searchQuery = '';
						showSuggestions = false;
					}}
					aria-label="清空搜索框"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			{/if}

			<button
				type="submit"
				class="absolute top-1/2 right-4 -translate-y-1/2 transform text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
				aria-label="搜索"
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
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</button>

			{#if showSuggestions && suggestions.length > 0}
				<div
					class="search-suggestions absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded-lg bg-white shadow-lg dark:bg-gray-800"
				>
					<ul>
						{#each suggestions as suggestion, i}
							<li>
								<button
									type="button"
									on:click={() => {
										selectSuggestion(i);
										handleSubmit();
									}}
									on:mouseover={() => (selectedIndex = i)}
									on:focus={() => (selectedIndex = i)}
									class={`block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedIndex === i ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
									aria-label={`選擇建議: ${suggestion}`}
								>
									<div class="flex items-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fill-rule="evenodd"
												d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
												clip-rule="evenodd"
											/>
										</svg>
										{suggestion}
									</div>
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</form>
</div>
