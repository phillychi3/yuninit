<script lang="ts">
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
	let error: null = null;
	let lastUpdated: Date | null = null;

	const weatherIcons: { [key: number]: string } = {
		0: '☀️',
		1: '🌤️',
		2: '⛅',
		3: '☁️',
		45: '🌫️',
		48: '🌫️',
		51: '🌦️',
		53: '🌦️',
		55: '🌦️',
		56: '🌨️',
		57: '🌨️',
		61: '🌧️',
		63: '🌧️',
		65: '🌧️',
		66: '�️',
		67: '🌨️',
		71: '❄️',
		73: '❄️',
		75: '❄️',
		77: '❄️',
		80: '🌦️',
		81: '🌦️',
		82: '🌦️',
		85: '�️',
		86: '🌨️',
		95: '⛈️',
		96: '⛈️',
		99: '⛈️'
	};

	function getWeatherIcon(code: number) {
		return weatherIcons[code] || '�️';
	}

	async function getLocationName(lat: number, lon: number): Promise<string> {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
				{
					headers: {
						'User-Agent': 'YunInit Weather App'
					}
				}
			);

			if (!response.ok) {
				console.error('無法獲取位置名稱');
				return '當前位置';
			}

			const data = await response.json();
			const city =
				data.address.city ||
				data.address.town ||
				data.address.village ||
				data.address.district ||
				data.address.county ||
				'當前位置';

			return city;
		} catch (error) {
			console.error('獲取位置名稱時出錯:', error);
			return '當前位置';
		}
	}

	async function getUserLocation() {
		return new Promise((resolve, reject) => {
			const savedLocation = getFromStorage('userLocation');

			if (savedLocation && savedLocation.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
				resolve(savedLocation);
				return;
			}

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

	function getWeatherCondition(code: number) {
		const weatherCodes: { [key: number]: string } = {
			0: '晴天',
			1: '晴時多雲',
			2: '多雲',
			3: '陰天',
			45: '霧',
			48: '霧凇',
			51: '毛毛雨',
			53: '小雨',
			55: '大雨',
			56: '凍雨',
			57: '凍雨',
			61: '小雨',
			63: '中雨',
			65: '大雨',
			66: '凍雨',
			67: '凍雨',
			71: '小雪',
			73: '中雪',
			75: '大雪',
			77: '細雪',
			80: '陣雨',
			81: '陣雨',
			82: '暴雨',
			85: '陣雪',
			86: '陣雪',
			95: '雷雨',
			96: '雷雨伴隨冰雹',
			99: '雷雨伴隨冰雹'
		};

		return weatherCodes[code] || '未知天氣';
	}

	// 修改 fetchWeatherData 函數
	async function fetchWeatherData(focus = false) {
		loading = true;
		error = null;

		try {
			const cachedWeather = getFromStorage('weatherData');
			if (cachedWeather && cachedWeather.timestamp > Date.now() - 30 * 60 * 1000 && !focus) {
				weather = cachedWeather.data;
				lastUpdated = new Date(cachedWeather.timestamp);
				loading = false;
				return;
			}

			const location = await getUserLocation();

			const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('無法從 Open-Meteo 獲取天氣數據');
			}

			const data = await response.json();

			const cityName = await getLocationName(location.latitude, location.longitude);

			const weatherCode = data.current.weather_code;
			const weatherCondition = getWeatherCondition(weatherCode);

			const weatherData = {
				temp: Math.round(data.current.temperature_2m),
				condition: weatherCondition,
				city: cityName,
				humidity: Math.round(data.current.relative_humidity_2m),
				windSpeed: Math.round(data.current.wind_speed_10m),
				icon: getWeatherIcon(weatherCode)
			};

			saveToStorage('weatherData', {
				data: weatherData,
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
			on:click={() => fetchWeatherData(true)}
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
					on:click={() => fetchWeatherData(true)}
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
