<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let date = new Date();
	let timeFormat = '24';
	let showSeconds = true;
	let timer: number | undefined;

	function updateTime() {
		date = new Date();
	}

	function toggleTimeFormat() {
		timeFormat = timeFormat === '24' ? '12' : '24';
	}

	function toggleShowSeconds() {
		showSeconds = !showSeconds;
	}

	function pad(num: { toString: () => string }) {
		return num.toString().padStart(2, '0');
	}

	function formatTime(date: Date) {
		let hours = date.getHours();
		const minutes = pad(date.getMinutes());
		const seconds = pad(date.getSeconds());
		let ampm = '';

		if (timeFormat === '12') {
			ampm = hours >= 12 ? ' PM' : ' AM';
			hours = hours % 12;
			hours = hours ? hours : 12;
		}

		const hoursStr = pad(hours);

		return showSeconds
			? `${hoursStr}:${minutes}:${seconds}${ampm}`
			: `${hoursStr}:${minutes}${ampm}`;
	}

	function getDateString(date: Date) {
		const options: Intl.DateTimeFormatOptions = {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		};

		return date.toLocaleDateString('zh-TW', options);
	}

	onMount(() => {
		timer = setInterval(updateTime, 1000);
	});

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});
</script>

<div class="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
	<div class="flex items-center justify-between bg-indigo-50 p-4 dark:bg-indigo-900">
		<h3 class="text-lg font-medium text-indigo-800 dark:text-indigo-100">時鐘</h3>
		<div class="flex space-x-2">
			<button
				on:click={toggleTimeFormat}
				class="rounded-md bg-indigo-100 px-2 py-1 text-xs text-indigo-500 transition-colors hover:text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100"
				title={timeFormat === '24' ? '切換至12小時制' : '切換至24小時制'}
			>
				{timeFormat === '24' ? '12H' : '24H'}
			</button>
			<button
				on:click={toggleShowSeconds}
				class="rounded-md bg-indigo-100 px-2 py-1 text-xs text-indigo-500 transition-colors hover:text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100"
				title={showSeconds ? '隱藏秒數' : '顯示秒數'}
			>
				{showSeconds ? '隱藏秒' : '顯示秒'}
			</button>
		</div>
	</div>

	<div class="p-6 text-center">
		<div class="mb-2 font-mono text-4xl font-bold text-gray-900 dark:text-gray-100">
			{formatTime(date)}
		</div>
		<div class="text-gray-600 dark:text-gray-400">
			{getDateString(date)}
		</div>
	</div>
</div>
