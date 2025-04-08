<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import Logo from '$lib/components/Logo.svelte';
	import EnhancedSearchBar from '$lib/components/EnhancedSearchBar.svelte';
	import CustomLinks from '$lib/components/CustomLinks.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import ToolsManager from '$lib/components/ToolsManager.svelte';

	let scrollY: number;
	let showExtraContent = false;
	let initialLoad = true;

	$: if (scrollY > 100) {
		showExtraContent = true;
	}

	function registerShortcuts() {
		document.addEventListener('keydown', handleKeydown);
	}

	function handleKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
			if (event.key === 'Escape') {
				(target as HTMLInputElement).value = '';
			}
			return;
		}

		switch (event.key) {
			case '/':
				event.preventDefault();
				const searchInput = document.querySelector('.search-form input[type="text"]');
				if (searchInput) {
					(searchInput as HTMLInputElement).focus();
				}
				break;
		}
	}

	onMount(() => {
		window.scrollTo(0, 0);
		setTimeout(() => {
			initialLoad = false;
		}, 100);
		registerShortcuts();

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:window bind:scrollY />

<svelte:head>
	<title>雲.tw</title>
	<meta name="description" content="雲.tw" />
</svelte:head>

<main class="flex min-h-screen flex-col items-center">
	<div class="flex min-h-screen w-full flex-col items-center justify-center px-4">
		<div class="mb-8">
			<Logo />
		</div>
		<EnhancedSearchBar />
	</div>

	{#if showExtraContent && !initialLoad}
		<div class="w-full px-4 pb-16" in:fade={{ duration: 300, delay: 100 }}>
			<div class="mx-auto max-w-4xl">
				<div class="mb-8" in:slide={{ duration: 300, delay: 200 }}>
					<CustomLinks />
				</div>
				<div in:slide={{ duration: 300, delay: 300 }}>
					<ToolsManager />
				</div>
			</div>
		</div>
	{/if}

	<Footer />

	<Settings />
</main>
