<script>
	export let type = 'button';
	export let variant = 'primary';
	export let size = 'md';
	export let disabled = false;
	export let fullWidth = false;
	export let icon = null;
	export let iconOnly = false;
	export let loading = false;
	export let className = '';

	const variantClasses = {
		primary:
			'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400',
		secondary:
			'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:focus:ring-gray-500',
		outline:
			'bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-300 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 dark:focus:ring-gray-600',
		text: 'bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-transparent dark:text-gray-300 dark:hover:bg-gray-800'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2',
		lg: 'px-6 py-3 text-lg'
	};

	const loadingColors = {
		primary: 'text-white',
		secondary: 'text-gray-600 dark:text-gray-200',
		outline: 'text-gray-600 dark:text-gray-300',
		text: 'text-gray-600 dark:text-gray-300'
	};

	const buttonClass = `
      rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200
      ${variantClasses[variant] || variantClasses.primary}
      ${iconOnly ? 'p-2' : sizeClasses[size] || sizeClasses.md}
      ${fullWidth ? 'w-full' : ''}
      ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
	  ${className}
    `;
</script>

<button {type} class={buttonClass} disabled={disabled || loading} on:click {...$$restProps}>
	{#if loading}
		<span class="flex items-center justify-center">
			<svg
				class={`mr-2 -ml-1 h-4 w-4 animate-spin ${loadingColors[variant]}`}
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			{#if !iconOnly}
				<slot>載入中...</slot>
			{/if}
		</span>
	{:else}
		<span class="flex items-center justify-center">
			{#if icon}
				<span class={`${!iconOnly ? 'mr-2' : ''}`}>{icon}</span>
			{/if}
			{#if !iconOnly}
				<slot></slot>
			{/if}
		</span>
	{/if}
</button>
