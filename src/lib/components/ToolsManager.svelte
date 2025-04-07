<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { toolsStore, availableTools } from '$lib/stores/toolsStore';

	import { Weather, Clock } from './tools';

	const toolComponents = {
		Weather,
		Clock
	};

	let showToolsModal = false;
	let activeTools = [];
	let draggingTool = null;
	let dragOverIndex = -1;

	const unsubscribe = toolsStore.subscribe((value) => {
		activeTools = value;
	});

	function showToolsSelector() {
		showToolsModal = true;
	}

	function addTool(toolId) {
		toolsStore.addTool(toolId);
	}

	function removeTool(toolId) {
		toolsStore.removeTool(toolId);
	}

	function isToolActive(toolId) {
		return activeTools.includes(toolId);
	}

	//
	function handleDragStart(event, index) {
		draggingTool = activeTools[index];
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', index);

		setTimeout(() => {
			event.target.classList.add('opacity-50');
		}, 0);
	}

	function handleDragEnd(event) {
		draggingTool = null;
		dragOverIndex = -1;
		event.target.classList.remove('opacity-50');
	}

	function handleDragOver(event, index) {
		event.preventDefault();
		if (draggingTool === null) return;
		dragOverIndex = index;
	}

	function handleDrop(event, index) {
		event.preventDefault();
		if (draggingTool === null) return;

		const dragIndex = activeTools.indexOf(draggingTool);
		if (dragIndex === index) return;

		const newActiveTools = [...activeTools];
		newActiveTools.splice(dragIndex, 1);
		newActiveTools.splice(index, 0, draggingTool);

		toolsStore.reorderTools(newActiveTools);

		draggingTool = null;
		dragOverIndex = -1;
	}

	onMount(() => {
		return () => {
			unsubscribe();
		};
	});
</script>

<div class="w-full">
	<!-- 工具管理按鈕 -->
	<div class="mb-4 flex justify-end">
		<button
			on:click={showToolsSelector}
			class="flex items-center rounded-md bg-purple-100 px-3 py-1.5 text-purple-700 transition-colors hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-1 h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
				/>
			</svg>
			<span class="text-sm">管理工具</span>
		</button>
	</div>

	<!-- 工具網格 -->
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
		{#each activeTools as toolId, index}
			{#each availableTools.filter((tool) => tool.id === toolId) as tool (tool.id)}
				<div
					class="tool-card relative"
					draggable={true}
					on:dragstart={(e) => handleDragStart(e, index)}
					on:dragend={handleDragEnd}
					on:dragover={(e) => handleDragOver(e, index)}
					on:drop={(e) => handleDrop(e, index)}
					class:border-2={dragOverIndex === index}
					class:border-purple-400={dragOverIndex === index}
					class:dark:border-purple-600={dragOverIndex === index}
					class:rounded-lg={dragOverIndex === index}
				>
					<div in:fade={{ duration: 200, delay: index * 50 }}>
						<svelte:component this={toolComponents[tool.component]} />
					</div>
				</div>
			{/each}
		{/each}
	</div>

	<!-- 如果沒有工具顯示提示 -->
	{#if activeTools.length === 0}
		<div
			class="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-2 text-3xl">🧰</div>
			<h3 class="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">沒有激活的工具</h3>
			<p class="mb-4 text-gray-500 dark:text-gray-400">點擊上方的「管理工具」按鈕添加一些工具</p>
			<button
				on:click={showToolsSelector}
				class="rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
			>
				添加工具
			</button>
		</div>
	{/if}

	{#if showToolsModal}
		<div
			class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
			in:fade={{ duration: 200 }}
		>
			<div
				class="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
				in:slide={{ duration: 200 }}
			>
				<div class="mb-6 flex items-center justify-between">
					<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">管理工具</h2>
					<button
						on:click={() => (showToolsModal = false)}
						class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						aria-label="關閉"
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

				<div class="mb-6 grid grid-cols-1 gap-3">
					{#each availableTools as tool}
						<div
							class="flex items-center rounded-lg border border-gray-200 p-3 dark:border-gray-700"
						>
							<div class="mr-3 flex-shrink-0 text-2xl">{tool.icon}</div>
							<div class="flex-1">
								<h3 class="font-medium text-gray-900 dark:text-gray-100">{tool.name}</h3>
								<p class="text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
							</div>
							<div>
								{#if isToolActive(tool.id)}
									<button
										on:click={() => removeTool(tool.id)}
										class="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
									>
										移除
									</button>
								{:else}
									<button
										on:click={() => addTool(tool.id)}
										class="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
									>
										添加
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<div class="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
					<button
						on:click={() => toolsStore.resetToDefault()}
						class="mr-auto px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
					>
						重置為默認
					</button>

					<button
						on:click={() => (showToolsModal = false)}
						class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
					>
						完成
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
