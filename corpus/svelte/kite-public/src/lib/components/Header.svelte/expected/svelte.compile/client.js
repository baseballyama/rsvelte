import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconClock, IconSearch, IconSettings, IconTextSize } from '@tabler/icons-svelte';
import { getContext, untrack } from 'svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { features } from '$lib/config/features';

import {
	displaySettings,
	languageSettings,
	settings,
	settingsModalState,
	themeSettings
} from '$lib/data/settings.svelte.js';

import { dataReloadService, dataService } from '$lib/services/dataService';
import { experimental } from '$lib/stores/experimental.svelte';
import { headerAnimation } from '$lib/stores/headerAnimation.svelte';
import { timeTravel } from '$lib/stores/timeTravel.svelte.js';
import { timeTravelBatch } from '$lib/stores/timeTravelBatch.svelte';
import { formatTimeAgo } from '$lib/utils/formatTimeAgo';
import { getNextUpdateCountdown } from '$lib/utils/getTimeAgo';
import AppNavigation from './AppNavigation.svelte';
import ChaosIndex from './ChaosIndex.svelte';

var root = $.from_html(`<div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 svelte-1elxaub"><div class="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full svelte-1elxaub"></div> <span class="text-sm svelte-1elxaub"> </span></div>`);
var root_1 = $.from_html(`<div><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400 svelte-1elxaub" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" class="svelte-1elxaub"></path></svg> <div class="text-sm font-medium text-blue-600 dark:text-blue-400 svelte-1elxaub"> </div> <button class="ms-1 p-0.5 focus-visible-ring rounded svelte-1elxaub" aria-label="Exit time travel mode and return to live news"><svg class="size-3 text-blue-600 dark:text-blue-400 svelte-1elxaub" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" class="svelte-1elxaub"></path></svg></button></div>`);
var root_2 = $.from_html(`<div class="cursor-pointer text-gray-500 dark:text-gray-400 text-base focus-visible-ring rounded px-1 py-1 svelte-1elxaub" role="button" tabindex="0" aria-live="polite"> </div>`);
var root_3 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="ms-1 inline h-4 w-4 text-red-500 svelte-1elxaub" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1l22 22M16.72 11.06a9 9 0 010 1.88M5.64 3.77A9.95 9.95 0 0112 2c2.35 0 4.5.78 6.22 2.08M12 18v-3.5M12 14H9" class="svelte-1elxaub"></path></svg>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 svelte-1elxaub"><div class="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full svelte-1elxaub"></div> <span class="text-sm svelte-1elxaub"> </span></div>`);
var root_6 = $.from_html(`<div class="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg svelte-1elxaub"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 svelte-1elxaub" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" class="svelte-1elxaub"></path></svg> <span class="text-sm font-medium text-blue-600 dark:text-blue-400 svelte-1elxaub"> </span> <button class="p-0.5 focus-visible-ring rounded shrink-0 svelte-1elxaub"><svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 svelte-1elxaub" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" class="svelte-1elxaub"></path></svg></button></div>`);
var root_7 = $.from_html(`<div class="sm:hidden flex items-center h-12 svelte-1elxaub"><!></div>`);
var root_8 = $.from_html(`<div class="h-12 flex items-center text-base whitespace-nowrap text-gray-500 dark:text-gray-400 svelte-1elxaub"><!></div>`);
var root_9 = $.from_html(`<div class="sm:hidden flex items-center h-12 overflow-hidden svelte-1elxaub"><div class="flex flex-col transition-transform duration-200 ease-out svelte-1elxaub"><div class="h-12 flex items-center svelte-1elxaub"><button><img class="w-[90px] h-auto logo z-modal-backdrop svelte-1elxaub" style="isolation: isolate;"/></button></div> <!></div></div>`);
var root_10 = $.from_html(`<div class="sm:hidden ms-2 me-3 svelte-1elxaub"><!></div>`);
var root_11 = $.from_html(`<div class="h-12 flex items-center justify-center whitespace-nowrap text-gray-500 dark:text-gray-400 text-base svelte-1elxaub"><!></div>`);
var root_12 = $.from_html(`<div class="cursor-pointer svelte-1elxaub" role="button" tabindex="0" aria-label="Click to stop animation"><div class="flex flex-col transition-transform duration-200 ease-out svelte-1elxaub"><div class="h-12 flex items-center justify-center svelte-1elxaub"><!></div> <!></div></div>`);
var root_13 = $.from_html(`<div class="hidden sm:block svelte-1elxaub"><!></div>`);
var root_14 = $.from_html(`<div class="flying-kite-container svelte-1elxaub"><img alt="" class="flying-kite svelte-1elxaub" aria-hidden="true"/></div>`);
var root_15 = $.from_html(`<header class="h-12 svelte-1elxaub"><div class="flex items-center justify-between relative h-full svelte-1elxaub"><!> <!> <div class="hidden sm:flex items-center svelte-1elxaub"><button class="me-2 p-0 border-0 bg-transparent cursor-pointer focus-visible-ring rounded svelte-1elxaub"><img class="w-[90px] h-auto logo relative z-modal-backdrop svelte-1elxaub" style="isolation: isolate;"/></button></div> <div class="hidden sm:flex absolute start-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 items-center h-12 overflow-hidden svelte-1elxaub"><!></div> <div class="ms-auto flex items-center gap-1.5 sm:gap-2 svelte-1elxaub"><!> <button class="p-1 sm:w-8 sm:h-8 sm:flex sm:items-center sm:justify-center sm:rounded-lg sm:hover:bg-gray-100 sm:dark:hover:bg-gray-800 svelte-1elxaub" type="button"><!></button> <button class="p-1 sm:w-8 sm:h-8 sm:flex sm:items-center sm:justify-center sm:rounded-lg sm:hover:bg-gray-100 sm:dark:hover:bg-gray-800 svelte-1elxaub" type="button"><!></button> <button class="p-1 sm:w-8 sm:h-8 sm:flex sm:items-center sm:justify-center sm:rounded-lg sm:hover:bg-gray-100 sm:dark:hover:bg-gray-800 svelte-1elxaub" type="button"><!></button> <button class="p-1 sm:w-8 sm:h-8 sm:flex sm:items-center sm:justify-center sm:rounded-lg sm:hover:bg-gray-100 sm:dark:hover:bg-gray-800 svelte-1elxaub" type="button"><!></button> <div class="h-[25px] flex items-center justify-center svelte-1elxaub"><div class="w-px h-full bg-gray-200 dark:bg-gray-700 svelte-1elxaub"></div></div> <!></div></div></header> <!>`, 1);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const // Props
	// Unix timestamp for calculating next update
	// Get session from context for subscription check
	// Date click state for cycling through different stats
	// Time travel state
	// Kite animation state
	// Time-based display state (updates every minute)
	// Update time-based displays every minute so they stay current
	// Update "Next update in X" countdown
	// Update "Updated X ago" text
	// Platform detection for keyboard shortcut
	// Don't handle clicks during animation
	// Cancel any pending hover animation
	// Call the parent handler (handles both shared view exit and normal home reset)
	// Reset date click count
	// Only trigger animation on hover, not on click
	// Already hovering
	// Only in browser
	// Don't trigger right after exiting time travel
	// Capture the element and its position immediately (before setTimeout)
	// 85% to the right
	// Set the starting position
	// Show the flying kite
	// Hide it after 8 seconds (it's off-screen by then)
	// 1.5 second hover delay
	// Cancel pending hover animation if mouse leaves before delay
	// If animation is showing, stop it and switch to normal cycling mode
	// If still on index 0, cycle to 1 instead of staying at 0
	// Normal cycling behavior (6 states: date, last update, next update, news today, stories read, week/day)
	// Handle date area keyboard events
	// Handle font size toggle
	// Helper to capitalize first letter
	// Computed date/stats display
	// If in time travel mode, show the selected date
	// Default date format
	// Next update countdown
	// Fallback if no timestamp available
	// Header cycling animation state
	// Cancel animation when entering time travel mode
	// One-time header animation - triggered when data is loaded
	// Animation sequence: show each item for 2s with quick flick transitions
	// Last updated
	// Next update
	// News today
	// Stories read
	// Week/Day
	// Back to logo
	// Check if animation was cancelled
	// Animation complete
	// Wait 2s on logo, then start sequence
	dateSection = ($$anchor) => {
		var fragment = root_4();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root();
				var span = $.sibling($.child(div), 2);
				var text = $.only_child(span, true);

				$.reset(div);

				$.template_effect(($0) => $.set_text(text, $0), [
					() => s("timeTravel.returningToLive") || "Returning to live..."
				]);

				$.append($$anchor, div);
			};

			var consequent_1 = ($$anchor) => {
				var div_1 = root_1();
				var div_2 = $.sibling($.child(div_1), 2);
				var text_1 = $.only_child(div_2, true);
				var button = $.sibling(div_2, 2);

				$.reset(div_1);

				$.template_effect(() => {
					$.set_class(
						div_1,
						1,
						`flex items-center gap-2 px-2 py-1 rounded-lg ${timeTravelBatch.entrySource === 'url' && !settings.timeTravelBannerDismissed.currentValue
							? 'tt-pill-highlight bg-blue-100 dark:bg-blue-800/50'
							: 'bg-blue-50 dark:bg-blue-900/30'}`,
						'svelte-1elxaub'
					);

					$.set_text(text_1, $.get(dateDisplay));
					button.disabled = $.get(isExitingTimeTravel);
				});

				$.delegated('click', button, async () => {
					timeTravel.reset();
					timeTravelBatch.clear();
					$.set(isExitingTimeTravel, true);

					try {
						await dataReloadService.reloadData();
					} finally {
						$.set(isExitingTimeTravel, false);
					}
				});

				$.append($$anchor, div_1);
			};

			var alternate = ($$anchor) => {
				var div_3 = root_2();
				var text_2 = $.only_child(div_3, true);

				$.template_effect(() => {
					$.set_attribute(div_3, 'aria-label', `Cycle through date and statistics. Current: ${$.get(dateDisplay) ?? ''}`);
					$.set_text(text_2, $.get(dateDisplay));
				});

				$.delegated('click', div_3, handleDateClick);
				$.delegated('keydown', div_3, handleDateKeydown);
				$.append($$anchor, div_3);
			};

			$.if(node, ($$render) => {
				if ($.get(isExitingTimeTravel)) $$render(consequent); else if (timeTravel.selectedDate) $$render(consequent_1, 1); else $$render(alternate, -1);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_2 = ($$anchor) => {
				var svg = root_3();

				$.append($$anchor, svg);
			};

			$.if(node_1, ($$render) => {
				if (offlineMode()) $$render(consequent_2);
			});
		}

		$.append($$anchor, fragment);
	};

	let totalReadCount = $.prop($$props, 'totalReadCount', 3, 0),
		totalStoriesRead = $.prop($$props, 'totalStoriesRead', 3, 0),
		offlineMode = $.prop($$props, 'offlineMode', 3, false),
		getLastUpdated = $.prop($$props, 'getLastUpdated', 3, () => 'Never'),
		isSharedView = $.prop($$props, 'isSharedView', 3, false),
		dataLoaded = $.prop($$props, 'dataLoaded', 3, false),
		chaosModalOpen = $.prop($$props, 'chaosModalOpen', 15, false);

	const session = getContext('session');
	const isSubscriber = $.derived(() => session?.subscription === true);
	let dateClickCount = $.state(0);
	let isExitingTimeTravel = $.state(false);
	const isInTimeTravel = $.derived(() => !!timeTravel.selectedDate || $.get(isExitingTimeTravel));
	let showFlyingKite = $.state(false);
	let kiteStartPosition = $.state($.proxy({ x: 0, y: 0 }));
	let hoverTimeout = null;
	let nextUpdateText = $.state('');
	let nextUpdateIsSoon = $.state(false);
	let lastUpdatedText = $.state('');

	$.user_effect(() => {
		if (browser && $$props.lastUpdatedTimestamp) {
			const lastUpdateDate = new Date($$props.lastUpdatedTimestamp * 1000).toISOString();

			const updateTimeDisplays = () => {
				// Update "Next update in X" countdown
				const countdown = getNextUpdateCountdown(lastUpdateDate);

				$.set(nextUpdateText, countdown.text, true);
				$.set(nextUpdateIsSoon, countdown.isSoon, true);

				// Update "Updated X ago" text
				$.set(lastUpdatedText, formatTimeAgo($$props.lastUpdatedTimestamp, s), true);
			};

			updateTimeDisplays();

			const interval = setInterval(updateTimeDisplays, 60000);

			return () => clearInterval(interval);
		}
	});

	// Platform detection for keyboard shortcut
	const isMac = browser && ('userAgentData' in navigator && navigator.userAgentData?.platform === 'macOS' || navigator.userAgent.toUpperCase().indexOf('MAC') >= 0);

	const searchTooltip = $.derived(() => s('header.search') + (isMac ? ' (⌘K)' : ' (Ctrl+K)'));

	function handleLogoClick() {
		// Don't handle clicks during animation
		if ($.get(isAnimating)) {
			return;
		}

		// Cancel any pending hover animation
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}

		// Call the parent handler (handles both shared view exit and normal home reset)
		if ($$props.onLogoClick) {
			$$props.onLogoClick();
		}

		// Reset date click count
		$.set(dateClickCount, 0);
	}

	function handleLogoHover(event) {
		// Only trigger animation on hover, not on click
		if (hoverTimeout) return; // Already hovering

		if (!browser) return; // Only in browser
		if ($.get(isExitingTimeTravel // Don't trigger right after exiting time travel
		)) return;

		// Capture the element and its position immediately (before setTimeout)
		const logoElement = event.currentTarget;

		const rect = logoElement.getBoundingClientRect();

		const startPosition = {
			x: rect.left + rect.width * 0.85, // 85% to the right
			y: rect.top + rect.height / 2
		};

		console.log('Logo hover started, waiting 1.5s...');

		hoverTimeout = setTimeout(
			() => {
				console.log('Triggering kite animation!');

				// Set the starting position
				$.set(kiteStartPosition, startPosition, true);

				// Show the flying kite
				$.set(showFlyingKite, true);

				console.log('showFlyingKite set to true', {
					kiteStartPosition: $.get(kiteStartPosition),
					showFlyingKite: $.get(showFlyingKite)
				});

				// Hide it after 8 seconds (it's off-screen by then)
				setTimeout(
					() => {
						$.set(showFlyingKite, false);
						console.log('Kite animation ended');
					},
					8000
				);

				hoverTimeout = null;
			},
			1500
		); // 1.5 second hover delay
	}

	function handleLogoLeave() {
		// Cancel pending hover animation if mouse leaves before delay
		if (hoverTimeout) {
			console.log('Logo hover cancelled (mouse left)');
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}
	}

	function handleDateClick(event) {
		// If animation is showing, stop it and switch to normal cycling mode
		if ($.get(showAnimation)) {
			event?.preventDefault();
			event?.stopPropagation();
			$.set(showAnimation, false);
			$.set(isAnimating, false);
			animationTimeouts.forEach(clearTimeout);
			animationTimeouts = [];

			// If still on index 0, cycle to 1 instead of staying at 0
			$.set(dateClickCount, headerAnimation.index === 0 ? 1 : headerAnimation.index, true);

			return;
		}

		// Normal cycling behavior (6 states: date, last update, next update, news today, stories read, week/day)
		$.set(dateClickCount, ($.get(dateClickCount) + 1) % 6);
	}

	// Handle date area keyboard events
	function handleDateKeydown(event) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleDateClick();
		}
	}

	// Handle font size toggle
	function toggleFontSize() {
		const fontSizes = ['xs', 'small', 'normal', 'large', 'xl'];
		const currentIndex = fontSizes.indexOf(displaySettings.fontSize);
		const nextIndex = (currentIndex + 1) % fontSizes.length;

		displaySettings.fontSize = fontSizes[nextIndex];
		settings.fontSize.save();
	}

	// Helper to capitalize first letter
	function capitalizeFirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	// Computed date/stats display
	const dateDisplay = $.derived(() => {
		// If in time travel mode, show the selected date
		if (timeTravel.selectedDate) {
			const dateStr = new Intl.DateTimeFormat(languageSettings.ui, {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			}).format(timeTravel.selectedDate);

			return capitalizeFirst(dateStr);
		}

		if ($.get(dateClickCount) === 0) {
			// Default date format
			const now = new Date();

			const dateStr = new Intl.DateTimeFormat(languageSettings.ui, { weekday: 'long', month: 'long', day: 'numeric' }).format(now);

			return capitalizeFirst(dateStr);
		} else if ($.get(dateClickCount) === 1) {
			return $.get(lastUpdatedText) || getLastUpdated()();
		} else if ($.get(dateClickCount) === 2) {
			// Next update countdown
			if ($.get(nextUpdateIsSoon)) {
				return s('time.nextUpdate.soon') || 'Next update: soon';
			} else if ($.get(nextUpdateText)) {
				return s('time.nextUpdate.in', { time: $.get(nextUpdateText) }) || `Next update in ${$.get(nextUpdateText)}`;
			}

			return ''; // Fallback if no timestamp available
		} else if ($.get(dateClickCount) === 3) {
			return s('stats.newsToday', { count: totalReadCount().toString() }) || `News today: ${totalReadCount()}`;
		} else if ($.get(dateClickCount) === 4) {
			const key = totalStoriesRead() === 1 ? 'stats.storyRead' : 'stats.storiesRead';

			return s(key, { count: totalStoriesRead().toString() }) || `Stories read: ${totalStoriesRead()}`;
		} else {
			const now = new Date();
			const start = new Date(now.getFullYear(), 0, 1);
			const week = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
			const day = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

			return s('stats.weekDay', { week: week.toString(), day: day.toString() }) || `Week ${week}, Day ${day}`;
		}
	});

	// Header cycling animation state
	let isAnimating = $.state(false);

	let showAnimation = $.state(true);
	let animationTimeouts = [];

	// Cancel animation when entering time travel mode
	$.user_effect(() => {
		if ($.get(isInTimeTravel) && $.get(isAnimating)) {
			$.set(isAnimating, false);
			$.set(showAnimation, false);
			animationTimeouts.forEach(clearTimeout);
			animationTimeouts = [];
			headerAnimation.index = 0;
		}
	});

	// One-time header animation - triggered when data is loaded
	$.user_effect(() => {
		if (browser && dataLoaded() && !headerAnimation.hasRun && !$.get(isInTimeTravel)) {
			headerAnimation.markAsRun();
			$.set(isAnimating, true);
			$.set(showAnimation, true);

			// Animation sequence: show each item for 2s with quick flick transitions
			const sequence = [
				{ index: 1, duration: 2000 }, // Last updated
				{ index: 2, duration: 2000 }, // Next update
				{ index: 3, duration: 2000 }, // News today
				{ index: 4, duration: 2000 }, // Stories read
				{ index: 5, duration: 2000 }, // Week/Day
				{ index: 0, duration: 0 } // Back to logo
			];

			let currentStep = 0;

			const runSequence = () => {
				// Check if animation was cancelled
				if (!$.get(isAnimating) || !$.get(showAnimation)) {
					$.set(showAnimation, false);
					$.set(isAnimating, false);

					return;
				}

				if (currentStep < sequence.length) {
					const step = sequence[currentStep];

					headerAnimation.index = step.index;
					currentStep++;

					if (step.duration > 0) {
						const timeout = setTimeout(runSequence, step.duration);

						animationTimeouts.push(timeout);
					} else {
						// Animation complete
						$.set(isAnimating, false);

						$.set(showAnimation, false);
					}
				}
			};

			// Wait 2s on logo, then start sequence
			const initialTimeout = setTimeout(runSequence, 2000);

			animationTimeouts.push(initialTimeout);
		}
	});

	var fragment_1 = root_15();
	var header = $.first_child(fragment_1);
	var div_4 = $.child(header);
	var node_2 = $.child(div_4);

	{
		var consequent_4 = ($$anchor) => {
			var div_5 = root_7();
			var node_3 = $.child(div_5);

			{
				var consequent_3 = ($$anchor) => {
					var div_6 = root_5();
					var span_1 = $.sibling($.child(div_6), 2);
					var text_3 = $.only_child(span_1, true);

					$.reset(div_6);

					$.template_effect(($0) => $.set_text(text_3, $0), [
						() => s("timeTravel.returningToLive") || "Returning to live..."
					]);

					$.append($$anchor, div_6);
				};

				var alternate_1 = ($$anchor) => {
					var div_7 = root_6();
					var span_2 = $.sibling($.child(div_7), 2);
					var text_4 = $.only_child(span_2, true);
					var button_1 = $.sibling(span_2, 2);

					$.reset(div_7);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_4, $0);
							$.set_attribute(button_1, 'aria-label', $1);
							button_1.disabled = $.get(isExitingTimeTravel);
						},
						[
							() => timeTravel.selectedDate
								? new Intl.DateTimeFormat(languageSettings.ui, { month: 'short', day: 'numeric' }).format(timeTravel.selectedDate)
								: '',
							() => s("timeTravel.exitLabel") || "Exit time travel mode"
						]
					);

					$.delegated('click', button_1, async () => {
						timeTravel.reset();
						timeTravelBatch.clear();
						$.set(isExitingTimeTravel, true);

						try {
							await dataReloadService.reloadData();
						} finally {
							$.set(isExitingTimeTravel, false);
						}
					});

					$.append($$anchor, div_7);
				};

				$.if(node_3, ($$render) => {
					if ($.get(isExitingTimeTravel)) $$render(consequent_3); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		var alternate_3 = ($$anchor) => {
			var div_8 = root_9();
			var div_9 = $.child(div_8);
			var div_10 = $.child(div_9);
			var button_2 = $.child(div_10);
			let classes;
			var img = $.only_child(button_2);

			$.reset(div_10);

			var node_4 = $.sibling(div_10, 2);

			$.each(node_4, 16, () => [1, 2, 3, 4, 5], $.index, ($$anchor, index) => {
				var div_11 = root_8();
				var node_5 = $.child(div_11);

				{
					var consequent_5 = ($$anchor) => {
						var text_5 = $.text();

						$.template_effect(($0) => $.set_text(text_5, $0), [() => $.get(lastUpdatedText) || getLastUpdated()()]);
						$.append($$anchor, text_5);
					};

					var consequent_8 = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_6 = $.first_child(fragment_3);

						{
							var consequent_6 = ($$anchor) => {
								var text_6 = $.text();

								$.template_effect(($0) => $.set_text(text_6, $0), [() => s('time.nextUpdate.soon') || 'Next update: soon']);
								$.append($$anchor, text_6);
							};

							var consequent_7 = ($$anchor) => {
								var text_7 = $.text();

								$.template_effect(($0) => $.set_text(text_7, $0), [
									() => s('time.nextUpdate.in', { time: $.get(nextUpdateText) }) || `Next update in ${$.get(nextUpdateText)}`
								]);

								$.append($$anchor, text_7);
							};

							$.if(node_6, ($$render) => {
								if ($.get(nextUpdateIsSoon)) $$render(consequent_6); else if ($.get(nextUpdateText)) $$render(consequent_7, 1);
							});
						}

						$.append($$anchor, fragment_3);
					};

					var consequent_9 = ($$anchor) => {
						var text_8 = $.text();

						$.template_effect(($0) => $.set_text(text_8, $0), [
							() => s('stats.newsToday', { count: totalReadCount().toString() }) || `News today: ${totalReadCount()}`
						]);

						$.append($$anchor, text_8);
					};

					var consequent_11 = ($$anchor) => {
						var fragment_7 = $.comment();
						var node_7 = $.first_child(fragment_7);

						{
							var consequent_10 = ($$anchor) => {
								var text_9 = $.text();

								$.template_effect(($0) => $.set_text(text_9, $0), [
									() => s('stats.storyRead', { count: totalStoriesRead().toString() }) || `Story read: ${totalStoriesRead()}`
								]);

								$.append($$anchor, text_9);
							};

							var alternate_2 = ($$anchor) => {
								var text_10 = $.text();

								$.template_effect(($0) => $.set_text(text_10, $0), [
									() => s('stats.storiesRead', { count: totalStoriesRead().toString() }) || `Stories read: ${totalStoriesRead()}`
								]);

								$.append($$anchor, text_10);
							};

							$.if(node_7, ($$render) => {
								if (totalStoriesRead() === 1) $$render(consequent_10); else $$render(alternate_2, -1);
							});
						}

						$.append($$anchor, fragment_7);
					};

					var consequent_12 = ($$anchor) => {
						var text_11 = $.text();

						$.template_effect(($0) => $.set_text(text_11, $0), [
							() => (() => {
								const now = new Date();
								const start = new Date(now.getFullYear(), 0, 1);
								const week = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
								const day = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

								return s('stats.weekDay', { week: week.toString(), day: day.toString() }) || `Week ${week}, Day ${day}`;
							})()
						]);

						$.append($$anchor, text_11);
					};

					$.if(node_5, ($$render) => {
						if (index === 1) $$render(consequent_5); else if (index === 2) $$render(consequent_8, 1); else if (index === 3) $$render(consequent_9, 2); else if (index === 4) $$render(consequent_11, 3); else if (index === 5) $$render(consequent_12, 4);
					});
				}

				$.reset(div_11);
				$.append($$anchor, div_11);
			});

			$.reset(div_9);
			$.reset(div_8);

			$.template_effect(
				($0, $1) => {
					$.set_style(div_9, `transform: translateY(${(2.5 - headerAnimation.index) * 48}px);`);
					$.set_attribute(button_2, 'aria-label', $0);
					button_2.disabled = $.get(isAnimating);

					classes = $.set_class(button_2, 1, 'p-0 border-0 bg-transparent focus-visible-ring rounded svelte-1elxaub', null, classes, {
						'cursor-pointer': !$.get(isAnimating),
						'cursor-default': $.get(isAnimating)
					});

					$.set_attribute(img, 'src', themeSettings.isDark
						? "/svg/kagi_news_compact_dark.svg"
						: "/svg/kagi_news_compact.svg");

					$.set_attribute(img, 'alt', $1);
				},
				[
					() => s("app.logo.clickToReset") || "Click to reset view to home",
					() => s("app.logo.newsAlt") || "Kite News"
				]
			);

			$.delegated('click', button_2, handleLogoClick);
			$.event('mouseenter', button_2, handleLogoHover);
			$.event('mouseleave', button_2, handleLogoLeave);
			$.append($$anchor, div_8);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isInTimeTravel)) $$render(consequent_4); else $$render(alternate_3, -1);
		});
	}

	var node_8 = $.sibling(node_2, 2);

	{
		var consequent_13 = ($$anchor) => {
			var div_12 = root_10();
			var node_9 = $.child(div_12);

			ChaosIndex(node_9, {
				get score() {
					return $$props.chaosIndex.score;
				},

				get summary() {
					return $$props.chaosIndex.summary;
				},

				get lastUpdated() {
					return $$props.chaosIndex.lastUpdated;
				},

				get onOpenChange() {
					return $$props.onChaosModalChange;
				},
				renderModal: false,
				get open() {
					return chaosModalOpen();
				},

				set open($$value) {
					chaosModalOpen($$value);
				}
			});

			$.reset(div_12);
			$.append($$anchor, div_12);
		};

		$.if(node_8, ($$render) => {
			if ($.get(isSubscriber) && experimental.showChaosIndex && $$props.chaosIndex && $$props.chaosIndex.score > 0 && !$.get(isAnimating) && !$.get(isInTimeTravel)) $$render(consequent_13);
		});
	}

	var div_13 = $.sibling(node_8, 2);
	var button_3 = $.child(div_13);
	var img_1 = $.only_child(button_3);

	$.reset(div_13);

	var div_14 = $.sibling(div_13, 2);
	var node_10 = $.child(div_14);

	{
		var consequent_22 = ($$anchor) => {
			var div_15 = root_12();
			var div_16 = $.child(div_15);
			var div_17 = $.child(div_16);
			var node_11 = $.child(div_17);

			dateSection(node_11);
			$.reset(div_17);

			var node_12 = $.sibling(div_17, 2);

			$.each(node_12, 16, () => [1, 2, 3, 4, 5], $.index, ($$anchor, index) => {
				var div_18 = root_11();
				var node_13 = $.child(div_18);

				{
					var consequent_14 = ($$anchor) => {
						var text_12 = $.text();

						$.template_effect(($0) => $.set_text(text_12, $0), [() => $.get(lastUpdatedText) || getLastUpdated()()]);
						$.append($$anchor, text_12);
					};

					var consequent_17 = ($$anchor) => {
						var fragment_12 = $.comment();
						var node_14 = $.first_child(fragment_12);

						{
							var consequent_15 = ($$anchor) => {
								var text_13 = $.text();

								$.template_effect(($0) => $.set_text(text_13, $0), [() => s('time.nextUpdate.soon') || 'Next update: soon']);
								$.append($$anchor, text_13);
							};

							var consequent_16 = ($$anchor) => {
								var text_14 = $.text();

								$.template_effect(($0) => $.set_text(text_14, $0), [
									() => s('time.nextUpdate.in', { time: $.get(nextUpdateText) }) || `Next update in ${$.get(nextUpdateText)}`
								]);

								$.append($$anchor, text_14);
							};

							$.if(node_14, ($$render) => {
								if ($.get(nextUpdateIsSoon)) $$render(consequent_15); else if ($.get(nextUpdateText)) $$render(consequent_16, 1);
							});
						}

						$.append($$anchor, fragment_12);
					};

					var consequent_18 = ($$anchor) => {
						var text_15 = $.text();

						$.template_effect(($0) => $.set_text(text_15, $0), [
							() => s('stats.newsToday', { count: totalReadCount().toString() }) || `News today: ${totalReadCount()}`
						]);

						$.append($$anchor, text_15);
					};

					var consequent_20 = ($$anchor) => {
						var fragment_16 = $.comment();
						var node_15 = $.first_child(fragment_16);

						{
							var consequent_19 = ($$anchor) => {
								var text_16 = $.text();

								$.template_effect(($0) => $.set_text(text_16, $0), [
									() => s('stats.storyRead', { count: totalStoriesRead().toString() }) || `Story read: ${totalStoriesRead()}`
								]);

								$.append($$anchor, text_16);
							};

							var alternate_4 = ($$anchor) => {
								var text_17 = $.text();

								$.template_effect(($0) => $.set_text(text_17, $0), [
									() => s('stats.storiesRead', { count: totalStoriesRead().toString() }) || `Stories read: ${totalStoriesRead()}`
								]);

								$.append($$anchor, text_17);
							};

							$.if(node_15, ($$render) => {
								if (totalStoriesRead() === 1) $$render(consequent_19); else $$render(alternate_4, -1);
							});
						}

						$.append($$anchor, fragment_16);
					};

					var consequent_21 = ($$anchor) => {
						var text_18 = $.text();

						$.template_effect(($0) => $.set_text(text_18, $0), [
							() => (() => {
								const now = new Date();
								const start = new Date(now.getFullYear(), 0, 1);
								const week = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
								const day = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

								return s('stats.weekDay', { week: week.toString(), day: day.toString() }) || `Week ${week}, Day ${day}`;
							})()
						]);

						$.append($$anchor, text_18);
					};

					$.if(node_13, ($$render) => {
						if (index === 1) $$render(consequent_14); else if (index === 2) $$render(consequent_17, 1); else if (index === 3) $$render(consequent_18, 2); else if (index === 4) $$render(consequent_20, 3); else if (index === 5) $$render(consequent_21, 4);
					});
				}

				$.reset(div_18);
				$.append($$anchor, div_18);
			});

			$.reset(div_16);
			$.reset(div_15);
			$.template_effect(() => $.set_style(div_16, `transform: translateY(${(2.5 - headerAnimation.index) * 48}px);`));
			$.delegated('click', div_15, (e) => handleDateClick(e));
			$.delegated('keydown', div_15, handleDateKeydown);
			$.append($$anchor, div_15);
		};

		var alternate_5 = ($$anchor) => {
			dateSection($$anchor);
		};

		$.if(node_10, ($$render) => {
			if ($.get(showAnimation) && !$.get(isInTimeTravel)) $$render(consequent_22); else $$render(alternate_5, -1);
		});
	}

	$.reset(div_14);

	var div_19 = $.sibling(div_14, 2);
	var node_16 = $.child(div_19);

	{
		var consequent_23 = ($$anchor) => {
			var div_20 = root_13();
			var node_17 = $.child(div_20);

			ChaosIndex(node_17, {
				get score() {
					return $$props.chaosIndex.score;
				},

				get summary() {
					return $$props.chaosIndex.summary;
				},

				get lastUpdated() {
					return $$props.chaosIndex.lastUpdated;
				},

				get onOpenChange() {
					return $$props.onChaosModalChange;
				},

				get open() {
					return chaosModalOpen();
				},

				set open($$value) {
					chaosModalOpen($$value);
				}
			});

			$.reset(div_20);
			$.append($$anchor, div_20);
		};

		$.if(node_16, ($$render) => {
			if ($.get(isSubscriber) && experimental.showChaosIndex && $$props.chaosIndex && $$props.chaosIndex.score > 0) $$render(consequent_23);
		});
	}

	var button_4 = $.sibling(node_16, 2);
	var node_18 = $.child(button_4);

	IconClock(node_18, {
		size: 24,
		stroke: 1.5,
		class: 'text-gray-600 dark:text-gray-400'
	});

	$.reset(button_4);

	var button_5 = $.sibling(button_4, 2);
	var node_19 = $.child(button_5);

	IconSearch(node_19, {
		size: 24,
		stroke: 1.5,
		class: 'text-gray-600 dark:text-gray-400'
	});

	$.reset(button_5);

	var button_6 = $.sibling(button_5, 2);
	var node_20 = $.child(button_6);

	IconTextSize(node_20, {
		size: 24,
		stroke: 1.5,
		class: 'text-gray-600 dark:text-gray-400'
	});

	$.reset(button_6);

	var button_7 = $.sibling(button_6, 2);
	var node_21 = $.child(button_7);

	IconSettings(node_21, {
		size: 24,
		stroke: 1.5,
		class: 'text-gray-600 dark:text-gray-400'
	});

	$.reset(button_7);

	var node_22 = $.sibling(button_7, 4);

	AppNavigation(node_22, {});
	$.reset(div_19);
	$.reset(div_4);
	$.reset(header);

	var node_23 = $.sibling(header, 2);

	{
		var consequent_24 = ($$anchor) => {
			var div_21 = root_14();
			var img_2 = $.only_child(div_21);

			$.template_effect(() => {
				$.set_style(div_21, `left: ${$.get(kiteStartPosition).x ?? ''}px; top: ${$.get(kiteStartPosition).y ?? ''}px;`);
				$.set_attribute(img_2, 'src', themeSettings.isDark ? "/svg/kite_dark.svg" : "/svg/kite.svg");
			});

			$.append($$anchor, div_21);
		};

		$.if(node_23, ($$render) => {
			if ($.get(showFlyingKite)) $$render(consequent_24);
		});
	}

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
			$.set_attribute(button_3, 'aria-label', $0);

			$.set_attribute(img_1, 'src', themeSettings.isDark
				? "/svg/kagi_news_compact_dark.svg"
				: "/svg/kagi_news_compact.svg");

			$.set_attribute(img_1, 'alt', $1);
			$.set_attribute(button_4, 'title', $2);
			$.set_attribute(button_4, 'aria-label', $3);
			$.set_attribute(button_5, 'title', $.get(searchTooltip));
			$.set_attribute(button_5, 'aria-label', $4);
			$.set_attribute(button_6, 'title', $5);
			$.set_attribute(button_6, 'aria-label', $6);
			$.set_attribute(button_7, 'title', $7);
			$.set_attribute(button_7, 'aria-label', $8);
		},
		[
			() => s("app.logo.clickToReset") || "Click to reset view to home",
			() => s("app.logo.newsAlt") || "Kite News",
			() => s("header.timeTravel") || "Time Travel",
			() => s("header.timeTravel") || "Time Travel",
			() => s("header.search") || "Search",
			() => s("header.fontSize") || "Font Size",
			() => s("header.fontSize") || "Font Size",
			() => s("header.settings") || "Settings",
			() => s("header.settings") || "Settings"
		]
	);

	$.delegated('click', button_3, handleLogoClick);
	$.event('mouseenter', button_3, handleLogoHover);
	$.event('mouseleave', button_3, handleLogoLeave);
	$.delegated('click', button_4, () => timeTravel.toggle());

	$.delegated('click', button_5, function (...$$args) {
		$$props.onSearchClick?.apply(this, $$args);
	});

	$.delegated('click', button_6, toggleFontSize);

	$.delegated('click', button_7, () => {
		settingsModalState.isOpen = true;
		document.body.classList.add('overflow-hidden');
	});

	$.append($$anchor, fragment_1);
	$.pop();
}

$.delegate(['click', 'keydown']);