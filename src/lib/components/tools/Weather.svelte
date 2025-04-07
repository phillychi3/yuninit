<script>
	import { onMount } from 'svelte';
	import { getFromStorage, saveToStorage } from '$lib/utils/storage';

	let weather = {
		temp: null,
		condition: '',
		city: '',
		humidity: null,
		windSpeed: null,
		icon: '🌤️'
	};

	let loading = true;
	let error = null;
	let lastUpdated = null;

	// 天氣條件至圖標的映射
	const weatherIcons = {
		clear: '☀️',
		sunny: '☀️',
		'partly cloudy': '⛅',
		cloudy: '☁️',
		overcast: '☁️',
		rain: '🌧️',
		shower: '🌧️',
		thunderstorm: '⛈️',
		snow: '❄️',
		mist: '🌫️',
		fog: '🌫️'
	};

	// 根據天氣狀況選擇適當的圖標
	function getWeatherIcon(condition) {
		if (!condition) return '🌤️';

		condition = condition.toLowerCase();

		for (const [key, icon] of Object.entries(weatherIcons)) {
			if (condition.includes(key)) {
				return icon;
			}
		}

		return '🌤️'; // 默認圖標
	}

	// 獲取用戶位置
	async function getUserLocation() {
		return new Promise((resolve, reject) => {
			// 首先嘗試從本地存儲獲取
			const savedLocation = getFromStorage('userLocation');

			if (savedLocation && savedLocation.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
				// 如果保存的位置不超過24小時
				resolve(savedLocation);
				return;
			}

			// 否則嘗試獲取新位置
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const location = {
							latitude: position.coords.latitude,
							longitude: position.coords.longitude,
							timestamp: Date.now()
						};
						saveToStorage('userLocation', location);
						resolve(location);
					},
					(err) => {
						console.error('無法獲取位置:', err);
						reject(new Error('無法獲取您的位置，請檢查位置權限設置'));
					},
					{ timeout: 5000 }
				);
			} else {
				reject(new Error('您的瀏覽器不支持地理位置功能'));
			}
		});
	}

	// 獲取天氣數據
	async function fetchWeatherData() {
		loading = true;
		error = null;

		try {
			// 檢查緩存的天氣數據
			const cachedWeather = getFromStorage('weatherData');
			if (cachedWeather && cachedWeather.timestamp > Date.now() - 30 * 60 * 1000) {
				// 如果緩存的數據不超過30分鐘，則使用它
				weather = cachedWeather.data;
				lastUpdated = new Date(cachedWeather.timestamp);
				loading = false;
				return;
			}

			// 獲取用戶位置
			const location = await getUserLocation();

			// 在實際應用中，這裡會調用真實的天氣 API
			// 這裡僅作演示，使用模擬數據

			// 模擬 API 請求延遲
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// 模擬天氣數據
			const weatherData = {
				temp: Math.floor(Math.random() * 15) + 15, // 15-30 度
				condition: ['晴天', '多雲', '陰天', '小雨'][Math.floor(Math.random() * 4)],
				city: '台北市',
				humidity: Math.floor(Math.random() * 40) + 40, // 40-80% 濕度
				windSpeed: Math.floor(Math.random() * 20) + 5 // 5-25 km/h 風速
			};

			// 更新天氣數據
			weather = {
				...weatherData,
				icon: getWeatherIcon(weatherData.condition)
			};

			// 緩存天氣數據
			saveToStorage('weatherData', {
				data: weather,
				timestamp: Date.now()
			});

			lastUpdated = new Date();
		} catch (err) {
			console.error('獲取天氣數據時出錯:', err);
			error = err.message || '無法獲取天氣數據';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchWeatherData();
	});
</script>

<div class="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
	<div class="flex items-center justify-between bg-blue-50 p-4 dark:bg-blue-900">
		<h3 class="text-lg font-medium text-blue-800 dark:text-blue-100">天氣資訊</h3>
		<button
			on:click={fetchWeatherData}
			class="text-blue-500 transition-colors hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
			aria-label="重新整理天氣資訊"
			title="重新整理天氣資訊"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>

	<div class="p-4">
		{#if loading}
			<div class="flex animate-pulse space-x-4 py-3">
				<div class="h-12 w-12 rounded-full bg-blue-200 dark:bg-blue-700"></div>
				<div class="flex-1 space-y-2 py-1">
					<div class="h-4 w-3/4 rounded bg-blue-200 dark:bg-blue-700"></div>
					<div class="h-4 w-5/6 rounded bg-blue-200 dark:bg-blue-700"></div>
				</div>
			</div>
		{:else if error}
			<div class="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-100">
				<p>{error}</p>
				<button
					on:click={fetchWeatherData}
					class="mt-2 text-xs text-red-600 underline hover:text-red-800 dark:text-red-300 dark:hover:text-red-100"
				>
					重新嘗試
				</button>
			</div>
		{:else}
			<div class="flex items-center">
				<div class="mr-4 text-4xl">
					{weather.icon}
				</div>
				<div>
					<div class="text-2xl font-bold text-gray-900 dark:text-gray-50">{weather.temp}°C</div>
					<div class="text-gray-700 dark:text-gray-300">{weather.condition} · {weather.city}</div>
				</div>
			</div>

			<div class="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
				<div class="flex items-center">
					<span class="mr-1">💧</span>
					<span>濕度: {weather.humidity}%</span>
				</div>
				<div class="flex items-center">
					<span class="mr-1">💨</span>
					<span>風速: {weather.windSpeed} km/h</span>
				</div>
			</div>

			{#if lastUpdated}
				<div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
					上次更新: {lastUpdated.toLocaleTimeString()}
				</div>
			{/if}
		{/if}
	</div>
</div>
