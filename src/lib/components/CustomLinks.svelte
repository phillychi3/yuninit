<script lang="ts">
	import { onMount } from 'svelte';

	let links = [
		{ title: 'Google', url: 'https://www.google.com' },
		{ title: 'Gmail', url: 'https://mail.google.com' },
		{ title: 'YouTube', url: 'https://www.youtube.com' },
		{ title: 'Maps', url: 'https://maps.google.com' }
	];

	let showAddForm = false;
	let newLink = { title: '', url: '' };
	let isEditing = false;
	let editIndex = -1;
	const Iconurl = 'https://www.google.com/s2/favicons?domain=';

	onMount(() => {
		const savedLinks = localStorage.getItem('customLinks');
		if (savedLinks) {
			try {
				links = JSON.parse(savedLinks);
			} catch (e) {
				console.error('無法解析儲存的連結:', e);
			}
		} else {
			localStorage.setItem('customLinks', JSON.stringify(links));
		}
	});

	function saveLinks() {
		localStorage.setItem('customLinks', JSON.stringify(links));
	}

	function addLink() {
		if (newLink.title && newLink.url) {
			if (!newLink.url.startsWith('http://') && !newLink.url.startsWith('https://')) {
				newLink.url = 'https://' + newLink.url;
			}

			if (isEditing && editIndex >= 0) {
				links[editIndex] = { ...newLink };
				isEditing = false;
				editIndex = -1;
			} else {
				links = [...links, { ...newLink }];
			}

			saveLinks();

			newLink = { title: '', url: '' };
			showAddForm = false;
		}
	}

	function editLink(index: number) {
		newLink = { ...links[index] };
		isEditing = true;
		editIndex = index;
		showAddForm = true;
	}

	function deleteLink(index: number) {
		if (confirm('確定要刪除此連結嗎？')) {
			links = links.filter((_, i) => i !== index);
			saveLinks();
		}
	}

	function cancelEdit() {
		newLink = { title: '', url: '' };
		isEditing = false;
		editIndex = -1;
		showAddForm = false;
	}
</script>

<div class="custom-links w-full">
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each links as link, index}
			<div class="group relative">
				<a
					href={link.url}
					class="flex h-24 flex-col items-center justify-center rounded-lg bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-gray-800 dark:text-gray-200 dark:shadow-gray-900/30"
				>
					<div class="mb-2 text-2xl">
						<img src={Iconurl + link.url} alt={link.title} class="h-4 w-4 rounded-full" />
					</div>
					<div class="w-full truncate text-center text-sm text-gray-700 dark:text-gray-300">
						{link.title}
					</div>
				</a>
				<div
					class="absolute top-1 right-1 flex opacity-0 transition-opacity duration-200 group-hover:opacity-100"
				>
					<button
						on:click|stopPropagation={() => editLink(index)}
						class="rounded-full bg-white p-1 text-gray-500 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
						aria-label="編輯連結"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
							/>
						</svg>
					</button>
					<button
						on:click|stopPropagation={() => deleteLink(index)}
						class="ml-1 rounded-full bg-white p-1 text-gray-500 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-red-400"
						aria-label="刪除連結"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		{/each}

		<button
			on:click={() => {
				isEditing = false;
				editIndex = -1;
				newLink = { title: '', url: '' };
				showAddForm = true;
			}}
			class="flex h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 transition-colors duration-300 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-8 w-8 text-gray-400 dark:text-gray-500"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 6v6m0 0v6m0-6h6m-6 0H6"
				/>
			</svg>
			<div class="mt-2 text-sm text-gray-500 dark:text-gray-400">添加連結</div>
		</button>
	</div>

	{#if showAddForm}
		<div
			class="bg-opacity-50 dark:bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black dark:bg-gray-900"
		>
			<div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
				<h2 class="mb-4 text-xl font-bold dark:text-white">
					{isEditing ? '編輯連結' : '添加新連結'}
				</h2>
				<form on:submit|preventDefault={addLink} class="space-y-4">
					<div>
						<label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>標題</label
						>
						<input
							type="text"
							id="title"
							bind:value={newLink.title}
							required
							class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
						/>
					</div>
					<div>
						<label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>URL</label
						>
						<input
							type="text"
							id="url"
							bind:value={newLink.url}
							required
							placeholder="例如: google.com 或 https://google.com"
							class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
						/>
					</div>
					<div class="mt-6 flex justify-end space-x-3">
						<button
							type="button"
							on:click={cancelEdit}
							class="rounded bg-gray-100 px-4 py-2 text-gray-800 transition-colors duration-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
						>
							取消
						</button>
						<button
							type="submit"
							class="rounded bg-blue-500 px-4 py-2 text-white transition-colors duration-300 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
						>
							{isEditing ? '儲存' : '添加'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
