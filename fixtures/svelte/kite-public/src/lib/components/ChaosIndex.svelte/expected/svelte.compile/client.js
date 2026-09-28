import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from 'chart.js/auto';
import Portal from 'svelte-portal';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { languageSettings } from '$lib/data/settings.svelte.js';
import { dataService } from '$lib/services/dataService';
import { createModalBehavior } from '$lib/utils/modalBehavior.svelte';
import { splitFirstSentence } from '$lib/utils/sentenceSplitter';
import LottieAnimation from './LottieAnimation.svelte';
import 'chartjs-adapter-date-fns';
import { useOverlayScrollbars } from 'overlayscrollbars-svelte';
import { fade } from 'svelte/transition';

var root = $.from_html(`<button class="flex items-center gap-1.5 rounded-md ps-1.5 pe-0 py-2 sm:px-1.5 md:px-2 md:py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="Show world tension details"><div></div> <span class="whitespace-nowrap"> <span class="hidden sm:inline"> </span></span></button>`);
var root_1 = $.from_html(`<div class="h-14 w-14 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>`);
var root_2 = $.from_html(`<p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400" dir="auto"> </p>`);
var root_3 = $.from_html(`<div class="mb-6"><h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300"> </h4> <div class="relative h-40 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50"><canvas class="absolute inset-0"></canvas></div></div>`);
var root_4 = $.from_html(`<div class="mb-6 animate-pulse"><div class="mb-3 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-40 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50"><div class="flex h-full items-end gap-1"><div class="flex h-full flex-col justify-between pb-5"><div class="h-2.5 w-6 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-2.5 w-6 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-2.5 w-6 rounded bg-gray-200 dark:bg-gray-700"></div></div> <div class="relative flex-1 h-full"><div class="absolute inset-x-0 top-0 border-t border-gray-200 dark:border-gray-700"></div> <div class="absolute inset-x-0 top-1/2 border-t border-gray-200 dark:border-gray-700"></div> <div class="absolute inset-x-0 bottom-5 border-t border-gray-200 dark:border-gray-700"></div> <svg class="absolute inset-0 w-full h-[calc(100%-20px)]" preserveAspectRatio="none" viewBox="0 0 200 80"><polyline points="0,50 25,45 50,55 75,40 100,48 125,35 150,42 175,38 200,44" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-200 dark:text-gray-700"></polyline></svg> <div class="absolute inset-x-0 bottom-0 flex justify-between"><div class="h-2.5 w-8 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-2.5 w-8 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-2.5 w-8 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-2.5 w-8 rounded bg-gray-200 dark:bg-gray-700"></div></div></div></div></div></div>`);
var root_5 = $.from_html(`<div class="mb-6 flex items-center justify-between"><div><div class="flex items-baseline gap-3"><span class="text-4xl font-bold tabular-nums text-gray-900 dark:text-white"> </span> <span class="text-lg font-medium text-gray-600 dark:text-gray-400"> </span></div> <p class="mt-1 text-sm text-gray-500 dark:text-gray-400"> </p></div> <div class="flex h-16 w-16 items-center justify-center"><!></div></div> <div class="mb-6"><div class="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"><div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 opacity-30"></div> <div></div> <div class="absolute h-full w-0.5 bg-gray-900 dark:bg-white"></div></div> <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400"><span>0</span> <span>50</span> <span>100</span></div></div>  <div class="mb-6 rounded-lg bg-gray-50 p-5 dark:bg-gray-800/50"><div class="space-y-2"><p class="text-base font-medium leading-relaxed text-gray-900 dark:text-gray-100" dir="auto"> </p> <!></div></div> <!> <div class="text-center"><button class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"> </button></div>`, 1);
var root_6 = $.from_html(`<div><button class="mb-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">← Back</button> <div class="space-y-5"><div><div class="space-y-1 text-sm"><div class="flex items-center gap-2"><div class="h-2 w-2 rounded-full bg-blue-500"></div> <span class="text-gray-600 dark:text-gray-400"> </span></div> <div class="flex items-center gap-2"><div class="h-2 w-2 rounded-full bg-green-500"></div> <span class="text-gray-600 dark:text-gray-400"> </span></div> <div class="flex items-center gap-2"><div class="h-2 w-2 rounded-full bg-yellow-500"></div> <span class="text-gray-600 dark:text-gray-400"> </span></div> <div class="flex items-center gap-2"><div class="h-2 w-2 rounded-full bg-orange-500"></div> <span class="text-gray-600 dark:text-gray-400"> </span></div> <div class="flex items-center gap-2"><div class="h-2 w-2 rounded-full bg-red-500"></div> <span class="text-gray-600 dark:text-gray-400"> </span></div></div></div> <div class="border-t border-gray-200 pt-4 dark:border-gray-700"><h4 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"> </h4> <p class="text-sm text-gray-600 dark:text-gray-400"> </p></div> <div><p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"> </p> <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li class="flex gap-2"><span class="text-gray-400">1.</span> <span> </span></li> <li class="flex gap-2"><span class="text-gray-400">2.</span> <span> </span></li> <li class="flex gap-2"><span class="text-gray-400">3.</span> <span> </span></li> <li class="flex gap-2"><span class="text-gray-400">4.</span> <span> </span></li></ul></div> <div class="border-t border-gray-200 pt-4 dark:border-gray-700"><h4 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"> </h4> <p class="text-sm text-gray-600 dark:text-gray-400"> </p></div></div></div>`);
var root_7 = $.from_html(`<div class="fixed inset-0 z-modal flex items-end justify-center bg-black/50 md:items-center md:p-4" role="dialog" aria-modal="true" aria-labelledby="chaos-title" tabindex="-1"><div class="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-xl md:h-auto md:max-h-[90vh] md:max-w-md md:rounded-lg dark:bg-gray-800"><div class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"><h3 id="chaos-title" class="text-lg font-semibold text-gray-900 dark:text-white"> </h3> <button class="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300" aria-label="Close dialog"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <main class="flex-1 overflow-y-auto p-6 md:min-h-[718px]" data-overlayscrollbars-initialize=""><!></main></div></div>`);
var root_8 = $.from_html(`<!> <!>`, 1);

export default function ChaosIndex($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let open = $.prop($$props, 'open', 15, false),
		renderModal = $.prop($$props, 'renderModal', 3, true);

	let showExplanation = $.state(false);
	let historicalData = $.state($.proxy([]));
	let isLoadingHistory = $.state(false);
	let chartCanvas = $.state(void 0);
	let chartInstance = null;
	let scrollContainer = $.state(void 0);

	// Modal behavior
	const modal = createModalBehavior();

	// Clear historical data cache when new chaos index data arrives
	let lastKnownUpdate;

	$.user_pre_effect(() => {
		const currentUpdate = $$props.lastUpdated;

		if (lastKnownUpdate !== undefined && currentUpdate !== lastKnownUpdate) {
			// Clear cached data so it gets re-fetched next time modal opens
			$.set(historicalData, [], true);

			// If modal is already open, trigger a refresh
			if (open() && !$.get(isLoadingHistory)) {
				refreshHistoricalData();
			}
		}

		lastKnownUpdate = currentUpdate;
	});

	// Fetch historical data
	async function refreshHistoricalData() {
		$.set(isLoadingHistory, true);

		try {
			$.set(historicalData, await dataService.getChaosIndexHistory(languageSettings.data, 30), true);
		} catch(error) {
			console.error('Failed to load historical data:', error);
		} finally {
			$.set(isLoadingHistory, false);
		}
	}

	// Initialize OverlayScrollbars
	const [initializeScrollbar] = useOverlayScrollbars({
		defer: false,
		options: {
			scrollbars: { visibility: 'auto', autoHide: 'leave', autoHideDelay: 800 },
			overflow: { x: 'hidden' }
		}
	});

	// Get temperature description
	function getTemperatureText() {
		if ($$props.score <= 20) return s('worldTension.cool') || 'Cool';
		if ($$props.score <= 40) return s('worldTension.mild') || 'Mild';
		if ($$props.score <= 60) return s('worldTension.warm') || 'Warm';
		if ($$props.score <= 80) return s('worldTension.hot') || 'Hot';

		return s('worldTension.burning') || 'Burning';
	}

	// Get status color classes
	function getStatusColor() {
		if ($$props.score <= 20) return 'from-blue-500 to-cyan-500';
		if ($$props.score <= 40) return 'from-green-500 to-emerald-500';
		if ($$props.score <= 60) return 'from-yellow-500 to-orange-500';
		if ($$props.score <= 80) return 'from-orange-500 to-red-500';

		return 'from-red-500 to-red-700';
	}

	// Import Lottie animations (these will be added from LottieFiles)
	let weatherAnimations = $.state($.proxy({}));

	// Load animations dynamically
	async function loadAnimations() {
		try {
			// Import all animations
			const [snow, sunnyCloudy, storm, smallFire, bigFire] = await Promise.all([
				import('$lib/assets/lottie/snow.json'),
				import('$lib/assets/lottie/sunny-cloudy.json'),
				import('$lib/assets/lottie/storm.json'), // Storm with lightning
				import('$lib/assets/lottie/small-fire.json'), // Small fire for "very hot"
				import('$lib/assets/lottie/big-fire.json') // Big violent fire for "on fire"
			]);

			$.set(
				weatherAnimations,
				{
					snow: snow.default || snow,
					sunnyCloudy: sunnyCloudy.default || sunnyCloudy,
					storm: storm.default || storm,
					smallFire: smallFire.default || smallFire,
					bigFire: bigFire.default || bigFire
				},
				true
			);
		} catch(error) {
			console.error('Failed to load animations:', error);
		}
	}

	// Get weather animation based on score
	function getWeatherAnimation() {
		if ($$props.score <= 20) return 'snow'; else // Cool - peaceful/cold
		if ($$props.score <= 40) return 'sunnyCloudy'; else // Mild - partly cloudy
		if ($$props.score <= 80) return 'smallFire'; else // Warm/Hot - fire
		return 'bigFire'; // Burning - big fire
	}

	// Handle click to show modal
	async function handleClick() {
		open(true);
		$$props.onOpenChange?.(true);
		$.set(showExplanation, false);

		// Push ?view=chaos to URL for deep-linking and back button support
		if (browser) {
			const url = new URL(window.location.href);

			if (url.searchParams.get('view') !== 'chaos') {
				url.searchParams.set('view', 'chaos');
				window.history.pushState({}, '', url.pathname + url.search);
			}
		}

		// Load animations if not already loaded
		if (Object.keys($.get(weatherAnimations)).length === 0) {
			await loadAnimations();
		}

		// Load historical data if not cached
		if (!$.get(isLoadingHistory) && $.get(historicalData).length === 0) {
			await refreshHistoricalData();
		}
	}

	// Handle close modal
	function closeModal() {
		open(false);
		$$props.onOpenChange?.(false);
		$.set(showExplanation, false);

		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}

		// Remove ?view=chaos from URL (replace, not push, to avoid double-back)
		if (browser) {
			const url = new URL(window.location.href);

			if (url.searchParams.has('view')) {
				url.searchParams.delete('view');

				const newUrl = url.pathname + (url.search || '');

				history.replaceState(history.state, '', newUrl);
			}
		}
	}

	// Close modal when browser back removes ?view=chaos
	$.user_effect(() => {
		if (!browser) return;

		const handlePopState = () => {
			const url = new URL(window.location.href);

			if (url.searchParams.get('view') !== 'chaos' && open()) {
				open(false);
				$$props.onOpenChange?.(false);
				$.set(showExplanation, false);

				if (chartInstance) {
					chartInstance.destroy();
					chartInstance = null;
				}
			}
		};

		window.addEventListener('popstate', handlePopState);

		return () => window.removeEventListener('popstate', handlePopState);
	});

	// Auto-open when open prop is set externally (e.g., from ?view=chaos on page load)
	$.user_effect(() => {
		if (open() && browser) {
			// Trigger data loading if modal was opened externally
			if (Object.keys($.get(weatherAnimations)).length === 0) {
				loadAnimations();
			}

			if (!$.get(isLoadingHistory) && $.get(historicalData).length === 0) {
				refreshHistoricalData();
			}
		}
	});

	// Score-to-color mapping — smooth interpolation between thresholds
	// Returns [r, g, b] for a given score so we can blend between adjacent thresholds.
	const COLOR_STOPS = [
		[0, [59, 130, 246]], // blue
		[20, [59, 130, 246]], // blue
		[30, [34, 197, 94]], // green
		[50, [251, 191, 36]], // yellow/amber
		[70, [251, 146, 60]], // orange
		[85, [239, 68, 68]], // red
		[100, [239, 68, 68]] // red
	];

	function getScoreRGB(value) {
		for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
			const [lo, loColor] = COLOR_STOPS[i];
			const [hi, hiColor] = COLOR_STOPS[i + 1];

			if (value >= lo && value <= hi) {
				const t = hi === lo ? 0 : (value - lo) / (hi - lo);

				return [
					Math.round(loColor[0] + (hiColor[0] - loColor[0]) * t),
					Math.round(loColor[1] + (hiColor[1] - loColor[1]) * t),
					Math.round(loColor[2] + (hiColor[2] - loColor[2]) * t)
				];
			}
		}

		return COLOR_STOPS[COLOR_STOPS.length - 1][1];
	}

	function getScoreColor(value, alpha = 1) {
		const [r, g, b] = getScoreRGB(value);

		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	// Create or update chart
	function createChart() {
		if (!$.get(chartCanvas) || $.get(historicalData).length < 2) return;

		if (chartInstance) {
			chartInstance.destroy();
		}

		const isDark = document.documentElement.classList.contains('dark');
		const ctx = $.get(chartCanvas).getContext('2d');
		const scores = $.get(historicalData).map((d) => d.score);

		chartInstance = new Chart($.get(chartCanvas), {
			type: 'line',
			data: {
				labels: $.get(historicalData).map((d) => new Date(d.date)),
				datasets: [
					{
						label: s('worldTension.chaosIndex') || 'Chaos Index',
						data: scores,
						borderColor: getScoreColor(scores[0] || $$props.score),
						backgroundColor: 'transparent',
						fill: false,
						tension: 0.35,
						pointRadius: $.get(historicalData).length <= 10 ? 3 : 0,
						pointHoverRadius: 5,
						pointBackgroundColor: scores.map((v) => getScoreColor(v)),
						pointBorderColor: scores.map((v) => getScoreColor(v, 0.8)),
						pointBorderWidth: 1,
						pointHoverBackgroundColor: scores.map((v) => getScoreColor(v)),
						borderWidth: 2.5
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: isDark
							? 'rgba(31, 41, 55, 0.95)'
							: 'rgba(255, 255, 255, 0.95)',
						titleColor: isDark ? '#e5e7eb' : '#1f2937',
						bodyColor: isDark ? '#e5e7eb' : '#1f2937',
						borderColor: isDark ? '#374151' : '#e5e7eb',
						borderWidth: 1,
						padding: 10,
						cornerRadius: 8,
						displayColors: false,
						callbacks: {
							title: (context) => {
								const timestamp = context[0].parsed.x;

								if (timestamp === null) return '';

								const date = new Date(timestamp);

								return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
							},

							label: (context) => {
								const value = context.parsed.y;

								return `${s('worldTension.chaosIndex') || 'Chaos Index'}: ${value}°`;
							}
						}
					}
				},
				scales: {
					x: {
						type: 'time',
						time: { unit: 'day', displayFormats: { day: 'MMM d' } },
						grid: { display: false },
						ticks: {
							color: isDark ? '#6b7280' : '#9ca3af',
							maxRotation: 0,
							font: { size: 10 }
						},
						border: { display: false }
					},
					y: {
						beginAtZero: true,
						max: 100,
						grid: {
							color: isDark ? 'rgba(55, 65, 81, 0.2)' : 'rgba(229, 231, 235, 0.6)'
						},
						ticks: {
							color: isDark ? '#6b7280' : '#9ca3af',
							callback: (value) => `${value}°`,
							font: { size: 10 },
							stepSize: 25
						},
						border: { display: false }
					}
				}
			},
			plugins: []
		});

		// Apply gradient after chart is created and layout is computed
		const chartArea = chartInstance.chartArea;

		if (chartArea && scores.length >= 2) {
			const width = chartArea.right - chartArea.left;
			const meta = chartInstance.getDatasetMeta(0);
			const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);

			for (let i = 0; i < scores.length; i++) {
				const px = meta.data[i]?.x ?? chartArea.left + i / (scores.length - 1) * width;
				const stop = Math.max(0, Math.min(1, (px - chartArea.left) / width));

				gradient.addColorStop(stop, getScoreColor(scores[i]));
			}

			chartInstance.data.datasets[0].borderColor = gradient;
			chartInstance.update('none');
		}
	}

	// Update chart when data changes
	$.user_effect(() => {
		if ($.get(historicalData).length >= 2 && open() && $.get(chartCanvas)) {
			setTimeout(createChart, 100);
		}
	});

	// Apply scroll lock
	$.user_effect(() => {
		if (open()) {
			return modal.applyScrollLock();
		}
	});

	// Initialize OverlayScrollbars when modal opens
	$.user_effect(() => {
		if (open() && $.get(scrollContainer)) {
			initializeScrollbar($.get(scrollContainer));
		}
	});

	// Toggle explanation
	function toggleExplanation() {
		$.set(showExplanation, !$.get(showExplanation));
	}

	var fragment = root_8();

	$.event('keydown', $.window, (e) => modal.handleKeydown(e, open(), closeModal));

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var div = $.child(button);
			var span = $.sibling(div, 2);
			var text = $.child(span);
			var span_1 = $.sibling(text);
			var text_1 = $.only_child(span_1, true);

			$.reset(span);
			$.reset(button);

			$.template_effect(
				($0, $1, $2) => {
					$.set_attribute(button, 'title', `World Tension: ${$$props.score ?? ''}° - ${$0 ?? ''}`);
					$.set_class(div, 1, `h-2 w-2 rounded-full bg-gradient-to-r ${$1 ?? ''}`);
					$.set_text(text, `${$$props.score ?? ''}°`);
					$.set_text(text_1, $2);
				},
				[
					() => getTemperatureText(),
					() => getStatusColor(),
					() => getTemperatureText()
				]
			);

			$.delegated('click', button, handleClick);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($$props.score > 0) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_6 = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_7();
					var div_2 = $.child(div_1);
					var div_3 = $.child(div_2);
					var h3 = $.child(div_3);
					var text_2 = $.only_child(h3, true);
					var button_1 = $.sibling(h3, 2);

					$.reset(div_3);

					var main = $.sibling(div_3, 2);
					var node_2 = $.child(main);

					{
						var consequent_5 = ($$anchor) => {
							const animationKey = $.derived(getWeatherAnimation);

							const computed_const = $.derived(() => {
								const [firstSentence, restText] = splitFirstSentence($$props.summary);

								return { firstSentence, restText };
							});

							var fragment_2 = root_5();
							var div_4 = $.first_child(fragment_2);
							var div_5 = $.child(div_4);
							var div_6 = $.child(div_5);
							var span_2 = $.child(div_6);
							var text_3 = $.only_child(span_2);
							var span_3 = $.sibling(span_2, 2);
							var text_4 = $.only_child(span_3, true);

							$.reset(div_6);

							var p = $.sibling(div_6, 2);
							var text_5 = $.only_child(p);

							$.reset(div_5);

							var div_7 = $.sibling(div_5, 2);
							var node_3 = $.child(div_7);

							{
								var consequent_1 = ($$anchor) => {
									{
										let $0 = $.derived(() => $.get(animationKey) === "bigFire" ? 2 : $.get(animationKey) === "smallFire" ? 1 : 0);

										LottieAnimation($$anchor, {
											get animationData() {
												return $.get(weatherAnimations)[$.get(animationKey)];
											},
											width: 80,
											height: 80,
											loop: true,
											autoplay: true,
											get loopFrameOffset() {
												return $.get($0);
											}
										});
									}
								};

								var alternate = ($$anchor) => {
									var div_8 = root_1();

									$.append($$anchor, div_8);
								};

								$.if(node_3, ($$render) => {
									if ($.get(weatherAnimations)[$.get(animationKey)]) $$render(consequent_1); else $$render(alternate, -1);
								});
							}

							$.reset(div_7);
							$.reset(div_4);

							var div_9 = $.sibling(div_4, 2);
							var div_10 = $.child(div_9);
							var div_11 = $.sibling($.child(div_10), 2);
							var div_12 = $.sibling(div_11, 2);

							$.reset(div_10);
							$.next(2);
							$.reset(div_9);

							var div_13 = $.sibling(div_9, 2);
							var div_14 = $.child(div_13);
							var p_1 = $.child(div_14);
							var text_6 = $.only_child(p_1, true);
							var node_4 = $.sibling(p_1, 2);

							{
								var consequent_2 = ($$anchor) => {
									var p_2 = root_2();
									var text_7 = $.only_child(p_2, true);

									$.template_effect(() => {
										$.set_text(text_7, $.get(computed_const).restText);
										p_2.dir = p_2.dir;
									});

									$.append($$anchor, p_2);
								};

								$.if(node_4, ($$render) => {
									if ($.get(computed_const).restText) $$render(consequent_2);
								});
							}

							$.reset(div_14);
							$.reset(div_13);

							var node_5 = $.sibling(div_13, 2);

							{
								var consequent_3 = ($$anchor) => {
									var div_15 = root_3();
									var h4 = $.child(div_15);
									var text_8 = $.only_child(h4, true);
									var div_16 = $.sibling(h4, 2);
									var canvas = $.child(div_16);

									$.bind_this(canvas, ($$value) => $.set(chartCanvas, $$value), () => $.get(chartCanvas));
									$.reset(div_16);
									$.reset(div_15);
									$.template_effect(($0) => $.set_text(text_8, $0), [() => s("worldTension.trendTitle") || "30-Day Trend"]);
									$.append($$anchor, div_15);
								};

								var consequent_4 = ($$anchor) => {
									var div_17 = root_4();

									$.append($$anchor, div_17);
								};

								$.if(node_5, ($$render) => {
									if ($.get(historicalData).length >= 2) $$render(consequent_3); else if ($.get(isLoadingHistory)) $$render(consequent_4, 1);
								});
							}

							var div_18 = $.sibling(node_5, 2);
							var button_2 = $.child(div_18);
							var text_9 = $.only_child(button_2, true);

							$.reset(div_18);

							$.template_effect(
								($0, $1, $2, $3, $4) => {
									$.set_text(text_3, `${$$props.score ?? ''}°`);
									$.set_text(text_4, $0);

									$.set_text(text_5, `${$1 ?? ''}
                ${$2 ?? ''}`);

									$.set_class(div_11, 1, `absolute start-0 h-full bg-gradient-to-r ${$3 ?? ''} transition-all duration-200`);
									$.set_style(div_11, `width: ${$$props.score ?? ''}%`);
									$.set_style(div_12, `inset-inline-start: ${$$props.score ?? ''}%`);
									$.set_text(text_6, $.get(computed_const).firstSentence);
									p_1.dir = p_1.dir;
									$.set_text(text_9, $4);
								},
								[
									() => getTemperatureText(),
									() => s("worldTension.updated") || "Updated",
									() => new Date($$props.lastUpdated).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										hour: "numeric",
										minute: "2-digit"
									}),
									() => getStatusColor(),
									() => s("worldTension.whatIsThis") || "What is this?"
								]
							);

							$.delegated('click', button_2, toggleExplanation);
							$.append($$anchor, fragment_2);
						};

						var alternate_1 = ($$anchor) => {
							var div_19 = root_6();
							var button_3 = $.child(div_19);
							var div_20 = $.sibling(button_3, 2);
							var div_21 = $.child(div_20);
							var div_22 = $.child(div_21);
							var div_23 = $.child(div_22);
							var span_4 = $.sibling($.child(div_23), 2);
							var text_10 = $.only_child(span_4, true);

							$.reset(div_23);

							var div_24 = $.sibling(div_23, 2);
							var span_5 = $.sibling($.child(div_24), 2);
							var text_11 = $.only_child(span_5, true);

							$.reset(div_24);

							var div_25 = $.sibling(div_24, 2);
							var span_6 = $.sibling($.child(div_25), 2);
							var text_12 = $.only_child(span_6, true);

							$.reset(div_25);

							var div_26 = $.sibling(div_25, 2);
							var span_7 = $.sibling($.child(div_26), 2);
							var text_13 = $.only_child(span_7, true);

							$.reset(div_26);

							var div_27 = $.sibling(div_26, 2);
							var span_8 = $.sibling($.child(div_27), 2);
							var text_14 = $.only_child(span_8, true);

							$.reset(div_27);
							$.reset(div_22);
							$.reset(div_21);

							var div_28 = $.sibling(div_21, 2);
							var h4_1 = $.child(div_28);
							var text_15 = $.only_child(h4_1, true);
							var p_3 = $.sibling(h4_1, 2);
							var text_16 = $.only_child(p_3, true);

							$.reset(div_28);

							var div_29 = $.sibling(div_28, 2);
							var p_4 = $.child(div_29);
							var text_17 = $.only_child(p_4, true);
							var ul = $.sibling(p_4, 2);
							var li = $.child(ul);
							var span_9 = $.sibling($.child(li), 2);
							var text_18 = $.only_child(span_9, true);

							$.reset(li);

							var li_1 = $.sibling(li, 2);
							var span_10 = $.sibling($.child(li_1), 2);
							var text_19 = $.only_child(span_10, true);

							$.reset(li_1);

							var li_2 = $.sibling(li_1, 2);
							var span_11 = $.sibling($.child(li_2), 2);
							var text_20 = $.only_child(span_11, true);

							$.reset(li_2);

							var li_3 = $.sibling(li_2, 2);
							var span_12 = $.sibling($.child(li_3), 2);
							var text_21 = $.only_child(span_12, true);

							$.reset(li_3);
							$.reset(ul);
							$.reset(div_29);

							var div_30 = $.sibling(div_29, 2);
							var h4_2 = $.child(div_30);
							var text_22 = $.only_child(h4_2, true);
							var p_5 = $.sibling(h4_2, 2);
							var text_23 = $.only_child(p_5, true);

							$.reset(div_30);
							$.reset(div_20);
							$.reset(div_19);

							$.template_effect(
								($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
									$.set_text(text_10, $0);
									$.set_text(text_11, $1);
									$.set_text(text_12, $2);
									$.set_text(text_13, $3);
									$.set_text(text_14, $4);
									$.set_text(text_15, $5);
									$.set_text(text_16, $6);
									$.set_text(text_17, $7);
									$.set_text(text_18, $8);
									$.set_text(text_19, $9);
									$.set_text(text_20, $10);
									$.set_text(text_21, $11);
									$.set_text(text_22, $12);
									$.set_text(text_23, $13);
								},
								[
									() => s("worldTension.scale.cool") || "0-20° Cool - Calm period, routine activity",
									() => s("worldTension.scale.mild") || "21-40° Mild - Normal global tensions",
									() => s("worldTension.scale.warm") || "41-60° Warm - Elevated concerns",
									() => s("worldTension.scale.hot") || "61-80° Hot - Serious situations",
									() => s("worldTension.scale.burning") || "81-100° Burning - Extreme crisis (rare)",
									() => s("worldTension.howCalculated") || "How it's calculated",
									() => s("worldTension.methodologyIntro") || "The World Tension index is generated by AI analysis of current World news headlines. Rather than a fixed formula, it uses reasoning to evaluate global stability.",
									() => s("worldTension.factorsTitle") || "The AI considers four key factors:",
									() => s("worldTension.factor.novelty") || "Novelty — New crises or escalations are weighted more heavily than ongoing situations that are already \"priced in.\"",
									() => s("worldTension.factor.worstCase") || "Proximity to worst case — How close events are to catastrophic outcomes, with nuclear/WMD situations given outsized weight.",
									() => s("worldTension.factor.reversibility") || "Reversibility — Irreversible actions (invasions, loss of life) are weighted more than reversible ones (sanctions, rhetoric).",
									() => s("worldTension.factor.scope") || "Scope of impact — Global systemic risks, economic contagion, and alliance triggers are weighed against localized events.",
									() => s("worldTension.consistencyTitle") || "Why this exists",
									() => s("worldTension.consistencyText") || "Between alarming headlines, doomscrolling, and 24/7 news cycles, it can feel like the world is constantly on fire. This index aims to provide a grounded perspective. Often, things aren't as bad as they feel."
								]
							);

							$.delegated('click', button_3, toggleExplanation);
							$.append($$anchor, div_19);
						};

						$.if(node_2, ($$render) => {
							if (!$.get(showExplanation)) $$render(consequent_5); else $$render(alternate_1, -1);
						});
					}

					$.reset(main);
					$.bind_this(main, ($$value) => $.set(scrollContainer, $$value), () => $.get(scrollContainer));
					$.reset(div_2);
					$.reset(div_1);
					$.template_effect(($0) => $.set_text(text_2, $0), [() => s("worldTension.title") || "Global Stability Index"]);
					$.delegated('click', div_1, (e) => modal.handleBackdropClick(e, closeModal));
					$.delegated('keydown', div_1, (e) => e.key === "Escape" && closeModal());
					$.delegated('click', button_1, closeModal);
					$.transition(3, div_1, () => fade, () => ({ duration: modal.getTransitionDuration() }));
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if (open() && renderModal()) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);