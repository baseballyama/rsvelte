import * as $ from 'svelte/internal/server';
import { IconWind } from '@tabler/icons-svelte';
import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';

export default function Weather($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { location = 'san-francisco' } = $$props;
		let loading = true;
		let data = null;

		async function fetchWeather() {
			try {
				const response = await fetch(`/api/widgets/weather?location=${location}`);

				if (response.ok) {
					const result = await response.json();

					data = result;
				} else {
					console.error('Weather API error:', response.status);
				}
			} catch(error) {
				console.error('Failed to fetch weather:', error);
			} finally {
				loading = false;
			}
		}

		// Weather code to icon mapping (WMO Weather interpretation codes)
		// Using Meteocons animated SVG icons
		function getWeatherIcon(code) {
			if (code === 0) return { icon: 'clear-day.svg', description: s('weather.clear') };

			if (code <= 3) return {
				icon: 'partly-cloudy-day.svg',
				description: s('weather.cloudy')
			};

			if (code <= 48) return { icon: 'fog.svg', description: s('weather.foggy') };
			if (code <= 67) return { icon: 'rain.svg', description: s('weather.rainy') };
			if (code <= 77) return { icon: 'snow.svg', description: s('weather.snowy') };
			if (code <= 82) return { icon: 'rain.svg', description: s('weather.rainy') };
			if (code <= 86) return { icon: 'sleet.svg', description: s('weather.snowy') };

			if (code <= 99) return {
				icon: 'thunderstorms-rain.svg',
				description: s('weather.stormy')
			};

			return { icon: 'cloudy.svg', description: s('weather.cloudy') };
		}

		onMount(() => {
			fetchWeather();

			// Refresh every 30 minutes
			const interval = setInterval(fetchWeather, 1800000);

			return () => clearInterval(interval);
		});

		$$renderer.push(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="px-4 py-3 min-h-[92px]">`);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="flex items-start justify-between h-full"><div class="flex items-center gap-3"><img src="/weather-icons/cloudy.svg" alt="Loading" class="h-16 w-16"/> <div class="flex flex-col"><span class="text-sm text-gray-600 dark:text-gray-400">${$.escape(s('weather.loading'))}</span></div></div></div>`);
		} else if (data?.error || !data?.data) {
			$$renderer.push(`<!--[1--><div class="flex items-start justify-between h-full"><div class="flex items-center gap-3"><img src="/weather-icons/cloudy.svg" alt="Error" class="h-16 w-16"/> <div class="flex flex-col"><span class="text-sm text-gray-600 dark:text-gray-400">${$.escape(s('weather.error'))}</span></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			const weatherInfo = getWeatherIcon(data.data.weatherCode);

			$$renderer.push(`<div class="flex items-start justify-between"><div class="flex items-center gap-3"><img${$.attr('src', `/weather-icons/${$.stringify(weatherInfo.icon)}`)}${$.attr('alt', weatherInfo.description)} class="h-16 w-16"/> <div class="flex flex-col"><span class="text-xs text-gray-600 dark:text-gray-400">${$.escape(s(`weather.location.${data.locationKey}`))}</span> <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">${$.escape(data.data.temperature)}°${$.escape(s('weather.fahrenheit'))}</span> <span class="text-sm text-gray-600 dark:text-gray-400">${$.escape(weatherInfo.description)}</span></div></div> <div class="flex flex-col gap-1 text-right text-xs text-gray-600 dark:text-gray-400"><div class="flex items-center justify-end gap-2"><span>↑ ${$.escape(data.data.temperatureMax)}°</span> <span>↓ ${$.escape(data.data.temperatureMin)}°</span></div> <div>${$.escape(s('weather.humidity'))}: ${$.escape(data.data.humidity)}%</div> <div class="flex items-center justify-end gap-1">`);
			IconWind($$renderer, { class: 'h-3 w-3' });
			$$renderer.push(`<!----> <span>${$.escape(data.data.windSpeed)} ${$.escape(s('weather.mph'))}</span></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}