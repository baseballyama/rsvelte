import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconWind } from '@tabler/icons-svelte';
import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<div class="flex items-start justify-between h-full"><div class="flex items-center gap-3"><img src="/weather-icons/cloudy.svg" alt="Loading" class="h-16 w-16"/> <div class="flex flex-col"><span class="text-sm text-gray-600 dark:text-gray-400"> </span></div></div></div>`);
var root_1 = $.from_html(`<div class="flex items-start justify-between h-full"><div class="flex items-center gap-3"><img src="/weather-icons/cloudy.svg" alt="Error" class="h-16 w-16"/> <div class="flex flex-col"><span class="text-sm text-gray-600 dark:text-gray-400"> </span></div></div></div>`);
var root_2 = $.from_html(`<div class="flex items-start justify-between"><div class="flex items-center gap-3"><img class="h-16 w-16"/> <div class="flex flex-col"><span class="text-xs text-gray-600 dark:text-gray-400"> </span> <span class="text-2xl font-bold text-gray-900 dark:text-gray-100"> </span> <span class="text-sm text-gray-600 dark:text-gray-400"> </span></div></div> <div class="flex flex-col gap-1 text-right text-xs text-gray-600 dark:text-gray-400"><div class="flex items-center justify-end gap-2"><span> </span> <span> </span></div> <div> </div> <div class="flex items-center justify-end gap-1"><!> <span> </span></div></div></div>`);
var root_3 = $.from_html(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="px-4 py-3 min-h-[92px]"><!></div></div>`);

export default function Weather($$anchor, $$props) {
	$.push($$props, true);

	let location = $.prop($$props, 'location', 3, 'san-francisco');
	let loading = $.state(true);
	let data = $.state(null);

	async function fetchWeather() {
		try {
			const response = await fetch(`/api/widgets/weather?location=${location()}`);

			if (response.ok) {
				const result = await response.json();

				$.set(data, result, true);
			} else {
				console.error('Weather API error:', response.status);
			}
		} catch(error) {
			console.error('Failed to fetch weather:', error);
		} finally {
			$.set(loading, false);
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

	var div = root_3();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var div_3 = $.child(div_2);
			var div_4 = $.sibling($.child(div_3), 2);
			var span = $.child(div_4);
			var text = $.only_child(span, true);

			$.reset(div_4);
			$.reset(div_3);
			$.reset(div_2);
			$.template_effect(($0) => $.set_text(text, $0), [() => s('weather.loading')]);
			$.append($$anchor, div_2);
		};

		var consequent_1 = ($$anchor) => {
			var div_5 = root_1();
			var div_6 = $.child(div_5);
			var div_7 = $.sibling($.child(div_6), 2);
			var span_1 = $.child(div_7);
			var text_1 = $.only_child(span_1, true);

			$.reset(div_7);
			$.reset(div_6);
			$.reset(div_5);
			$.template_effect(($0) => $.set_text(text_1, $0), [() => s('weather.error')]);
			$.append($$anchor, div_5);
		};

		var alternate = ($$anchor) => {
			const weatherInfo = $.derived(() => getWeatherIcon($.get(data).data.weatherCode));
			var div_8 = root_2();
			var div_9 = $.child(div_8);
			var img = $.child(div_9);
			var div_10 = $.sibling(img, 2);
			var span_2 = $.child(div_10);
			var text_2 = $.only_child(span_2, true);
			var span_3 = $.sibling(span_2, 2);
			var text_3 = $.only_child(span_3);
			var span_4 = $.sibling(span_3, 2);
			var text_4 = $.only_child(span_4, true);

			$.reset(div_10);
			$.reset(div_9);

			var div_11 = $.sibling(div_9, 2);
			var div_12 = $.child(div_11);
			var span_5 = $.child(div_12);
			var text_5 = $.only_child(span_5);
			var span_6 = $.sibling(span_5, 2);
			var text_6 = $.only_child(span_6);

			$.reset(div_12);

			var div_13 = $.sibling(div_12, 2);
			var text_7 = $.only_child(div_13);
			var div_14 = $.sibling(div_13, 2);
			var node_1 = $.child(div_14);

			IconWind(node_1, { class: 'h-3 w-3' });

			var span_7 = $.sibling(node_1, 2);
			var text_8 = $.only_child(span_7);

			$.reset(div_14);
			$.reset(div_11);
			$.reset(div_8);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_attribute(img, 'src', `/weather-icons/${$.get(weatherInfo).icon ?? ''}`);
					$.set_attribute(img, 'alt', $.get(weatherInfo).description);
					$.set_text(text_2, $0);
					$.set_text(text_3, `${$.get(data).data.temperature ?? ''}°${$1 ?? ''}`);
					$.set_text(text_4, $.get(weatherInfo).description);
					$.set_text(text_5, `↑ ${$.get(data).data.temperatureMax ?? ''}°`);
					$.set_text(text_6, `↓ ${$.get(data).data.temperatureMin ?? ''}°`);
					$.set_text(text_7, `${$2 ?? ''}: ${$.get(data).data.humidity ?? ''}%`);
					$.set_text(text_8, `${$.get(data).data.windSpeed ?? ''} ${$3 ?? ''}`);
				},
				[
					() => s(`weather.location.${$.get(data).locationKey}`),
					() => s('weather.fahrenheit'),
					() => s('weather.humidity'),
					() => s('weather.mph')
				]
			);

			$.append($$anchor, div_8);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if ($.get(data)?.error || !$.get(data)?.data) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}