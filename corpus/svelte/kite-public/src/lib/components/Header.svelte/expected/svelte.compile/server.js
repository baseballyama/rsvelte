import * as $ from 'svelte/internal/server';
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

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		// Unix timestamp for calculating next update
		let {
			totalReadCount = 0,
			totalStoriesRead = 0,
			offlineMode = false,
			getLastUpdated = () => 'Never',
			lastUpdatedTimestamp,
			chaosIndex,
			onSearchClick,
			isSharedView = false,
			onLogoClick,
			dataLoaded = false,
			chaosModalOpen = false,
			onChaosModalChange
		} = $$props;

		// Get session from context for subscription check
		const session = getContext('session');

		const isSubscriber = $.derived(() => session?.subscription === true);

		// Date click state for cycling through different stats
		let dateClickCount = 0;

		// Time travel state
		let isExitingTimeTravel = false;

		const isInTimeTravel = $.derived(() => !!timeTravel.selectedDate || isExitingTimeTravel);

		// Kite animation state
		let showFlyingKite = false;

		let kiteStartPosition = { x: 0, y: 0 };
		let hoverTimeout = null;

		// Time-based display state (updates every minute)
		let nextUpdateText = '';

		let nextUpdateIsSoon = false;
		let lastUpdatedText = '';

		// Update time-based displays every minute so they stay current
		// Update "Next update in X" countdown
		// Update "Updated X ago" text
		// Platform detection for keyboard shortcut
		const isMac = browser && ('userAgentData' in navigator && navigator.userAgentData?.platform === 'macOS' || navigator.userAgent.toUpperCase().indexOf('MAC') >= 0);

		const searchTooltip = $.derived(() => s('header.search') + (isMac ? ' (⌘K)' : ' (Ctrl+K)'));

		function handleLogoClick() {
			// Don't handle clicks during animation
			if (isAnimating) {
				return;
			}

			// Cancel any pending hover animation
			if (hoverTimeout) {
				clearTimeout(hoverTimeout);
				hoverTimeout = null;
			}

			// Call the parent handler (handles both shared view exit and normal home reset)
			if (onLogoClick) {
				onLogoClick();
			}

			// Reset date click count
			dateClickCount = 0;
		}

		function handleLogoHover(event) {
			// Only trigger animation on hover, not on click
			if (hoverTimeout) return; // Already hovering

			if (!browser) return; // Only in browser
			if (isExitingTimeTravel) return; // Don't trigger right after exiting time travel

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
					kiteStartPosition = startPosition;

					// Show the flying kite
					showFlyingKite = true;

					console.log('showFlyingKite set to true', { kiteStartPosition, showFlyingKite });

					// Hide it after 8 seconds (it's off-screen by then)
					setTimeout(
						() => {
							showFlyingKite = false;
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
			if (showAnimation) {
				event?.preventDefault();
				event?.stopPropagation();
				showAnimation = false;
				isAnimating = false;
				animationTimeouts.forEach(clearTimeout);
				animationTimeouts = [];

				// If still on index 0, cycle to 1 instead of staying at 0
				dateClickCount = headerAnimation.index === 0 ? 1 : headerAnimation.index;

				return;
			}

			// Normal cycling behavior (6 states: date, last update, next update, news today, stories read, week/day)
			dateClickCount = (dateClickCount + 1) % 6;
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

			if (dateClickCount === 0) {
				// Default date format
				const now = new Date();

				const dateStr = new Intl.DateTimeFormat(languageSettings.ui, { weekday: 'long', month: 'long', day: 'numeric' }).format(now);

				return capitalizeFirst(dateStr);
			} else if (dateClickCount === 1) {
				return lastUpdatedText || getLastUpdated();
			} else if (dateClickCount === 2) {
				// Next update countdown
				if (nextUpdateIsSoon) {
					return s('time.nextUpdate.soon') || 'Next update: soon';
				} else if (nextUpdateText) {
					return s('time.nextUpdate.in', { time: nextUpdateText }) || `Next update in ${nextUpdateText}`;
				}

				return ''; // Fallback if no timestamp available
			} else if (dateClickCount === 3) {
				return s('stats.newsToday', { count: totalReadCount.toString() }) || `News today: ${totalReadCount}`;
			} else if (dateClickCount === 4) {
				const key = totalStoriesRead === 1 ? 'stats.storyRead' : 'stats.storiesRead';

				return s(key, { count: totalStoriesRead.toString() }) || `Stories read: ${totalStoriesRead}`;
			} else {
				const now = new Date();
				const start = new Date(now.getFullYear(), 0, 1);
				const week = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
				const day = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

				return s('stats.weekDay', { week: week.toString(), day: day.toString() }) || `Week ${week}, Day ${day}`;
			}
		});

		// Header cycling animation state
		let isAnimating = false;

		let showAnimation = true;
		let animationTimeouts = [];

		function // Cancel animation when entering time travel mode
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
		dateSection($$renderer) {
			if (isExitingTimeTravel) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 svelte-1elxaub"><div class="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full svelte-1elxaub"></div> <span class="text-sm svelte-1elxaub">${$.escape(s("timeTravel.returningToLive") || "Returning to live...")}</span></div>`);
			} else if (timeTravel.selectedDate) {
				$$renderer.push(`<!--[1--><div${$.attr_class(
					`flex items-center gap-2 px-2 py-1 rounded-lg ${timeTravelBatch.entrySource === 'url' && !settings.timeTravelBannerDismissed.currentValue
						? 'tt-pill-highlight bg-blue-100 dark:bg-blue-800/50'
						: 'bg-blue-50 dark:bg-blue-900/30'}`,
					'svelte-1elxaub'
				)}><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400 svelte-1elxaub" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" class="svelte-1elxaub"></path></svg> <div class="text-sm font-medium text-blue-600 dark:text-blue-400 svelte-1elxaub">${$.escape(dateDisplay())}</div> <button class="ms-1 p-0.5 focus-visible-ring rounded svelte-1elxaub" aria-label="Exit time travel mode and return to live news"${$.attr('disabled', isExitingTimeTravel, true)}><svg class="size-3 text-blue-600 dark:text-blue-400 svelte-1elxaub" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" class="svelte-1elxaub"></path></svg></button></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="cursor-pointer text-gray-500 dark:text-gray-400 text-base focus-visible-ring rounded px-1 py-1 svelte-1elxaub" role="button" tabindex="0"${$.attr('aria-label', `Cycle through date and statistics. Current: ${$.stringify(dateDisplay())}`)} aria-live="polite">${$.escape(dateDisplay())}</div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (offlineMode) {
				$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" class="ms-1 inline h-4 w-4 text-red-500 svelte-1elxaub" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1l22 22M16.72 11.06a9 9 0 010 1.88M5.64 3.77A9.95 9.95 0 0112 2c2.35 0 4.5.78 6.22 2.08M12 18v-3.5M12 14H9" class="svelte-1elxaub"></path></svg>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<header class="h-12 svelte-1elxaub"><div class="flex items-center justify-between relative h-full svelte-1elxaub">`);

			if (isInTimeTravel()) {
				$$renderer.push(`<!--[0--><div class="sm:hidden flex items-center h-12 svelte-1elxaub">`);

				if (isExitingTimeTravel) {
					$$renderer.push(`<!--[0--><div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 svelte-1elxaub"><div class="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full svelte-1elxaub"></div> <span class="text-sm svelte-1elxaub">${$.escape(s("timeTravel.returningToLive") || "Returning to live...")}</span></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg svelte-1elxaub"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 svelte-1elxaub" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" class="svelte-1elxaub"></path></svg> <span class="text-sm font-medium text-blue-600 dark:text-blue-400 svelte-1elxaub">${$.escape(timeTravel.selectedDate
						? new Intl.DateTimeFormat(languageSettings.ui, { month: 'short', day: 'numeric' }).format(timeTravel.selectedDate)
						: '')}</span> <button class="p-0.5 focus-visible-ring rounded shrink-0 svelte-1elxaub"${$.attr('aria-label', s("timeTravel.exitLabel") || "Exit time travel mode")}${$.attr('disabled', isExitingTimeTravel, true)}><svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 svelte-1elxaub" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" class="svelte-1elxaub"></path></svg></button></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="sm:hidden flex items-center h-12 overflow-hidden svelte-1elxaub"><div class="flex flex-col transition-transform duration-200 ease-out svelte-1elxaub"${$.attr_style(`transform: translateY(${$.stringify((2.5 - headerAnimation.index) * 48)}px);`)}><div class="h-12 flex items-center svelte-1elxaub"><button${$.attr('aria-label', s("app.logo.clickToReset") || "Click to reset view to home")}${$.attr('disabled', isAnimating, true)}${$.attr_class('p-0 border-0 bg-transparent focus-visible-ring rounded svelte-1elxaub', void 0, {
					'cursor-pointer': !isAnimating,
					'cursor-default': isAnimating
				})}><img${$.attr('src', themeSettings.isDark
					? "/svg/kagi_news_compact_dark.svg"
					: "/svg/kagi_news_compact.svg")}${$.attr('alt', s("app.logo.newsAlt") || "Kite News")} class="w-[90px] h-auto logo z-modal-backdrop svelte-1elxaub" style="isolation: isolate;"/></button></div> <!--[-->`);

				const each_array = $.ensure_array_like([1, 2, 3, 4, 5]);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let index = each_array[$$index];

					$$renderer.push(`<div class="h-12 flex items-center text-base whitespace-nowrap text-gray-500 dark:text-gray-400 svelte-1elxaub">`);

					if (index === 1) {
						$$renderer.push(`<!--[0-->${$.escape(lastUpdatedText || getLastUpdated())}`);
					} else if (index === 2) {
						$$renderer.push('<!--[1-->');

						if (nextUpdateIsSoon) {
							$$renderer.push(`<!--[0-->${$.escape(s('time.nextUpdate.soon') || 'Next update: soon')}`);
						} else if (nextUpdateText) {
							$$renderer.push(`<!--[1-->${$.escape(s('time.nextUpdate.in', { time: nextUpdateText }) || `Next update in ${nextUpdateText}`)}`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else if (index === 3) {
						$$renderer.push(`<!--[2-->${$.escape(s('stats.newsToday', { count: totalReadCount.toString() }) || `News today: ${totalReadCount}`)}`);
					} else if (index === 4) {
						$$renderer.push('<!--[3-->');

						if (totalStoriesRead === 1) {
							$$renderer.push(`<!--[0-->${$.escape(s('stats.storyRead', { count: totalStoriesRead.toString() }) || `Story read: ${totalStoriesRead}`)}`);
						} else {
							$$renderer.push(`<!--[-1-->${$.escape(s('stats.storiesRead', { count: totalStoriesRead.toString() }) || `Stories read: ${totalStoriesRead}`)}`);
						}

						$$renderer.push(`<!--]-->`);
					} else if (index === 5) {
						$$renderer.push(`<!--[4-->${$.escape((() => {
							const now = new Date();
							const start = new Date(now.getFullYear(), 0, 1);
							const week = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
							const day = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

							return s('stats.weekDay', { week: week.toString(), day: day.toString() }) || `Week ${week}, Day ${day}`;
						})())}`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (isSubscriber() && experimental.showChaosIndex && chaosIndex && chaosIndex.score > 0 && !isAnimating && !isInTimeTravel()) {
				$$renderer.push(`<!--[0--><div class="sm:hidden ms-2 me-3 svelte-1elxaub">`);

				ChaosIndex($$renderer, {
					score: chaosIndex.score,
					summary: chaosIndex.summary,
					lastUpdated: chaosIndex.lastUpdated,
					onOpenChange: onChaosModalChange,
					renderModal: false,
					get open() {
						return chaosModalOpen;
					},

					set open($$value) {
						chaosModalOpen = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="hidden sm:flex items-center svelte-1elxaub"><button${$.attr('aria-label', s("app.logo.clickToReset") || "Click to reset view to home")} class="me-2 p-0 border-0 bg-transparent cursor-pointer focus-visible-ring rounded svelte-1elxaub"><img${$.attr('src', themeSettings.isDark
				? "/svg/kagi_news_compact_dark.svg"
				: "/svg/kagi_news_compact.svg")}${$.attr('alt', s("app.logo.newsAlt") || "Kite News")} class="w-[90px] h-auto logo relative z-modal-backdrop svelte-1elxaub" style="isolation: isolate;"/></button></div> <div class="hidden sm:flex absolute start-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 items-center h-12 overflow-hidden svelte-1elxaub">`);

			if (showAnimation && !isInTimeTravel()) {
				$$renderer.push(`<!--[0--><div class="cursor-pointer svelte-1elxaub" role="button" tabindex="0" aria-label="Click to stop animation"><div class="flex flex-col transition-transform duration-200 ease-out svelte-1elxaub"${$.attr_style(`transform: translateY(${$.stringify((2.5 - headerAnimation.index) * 48)}px);`)}><div class="h-12 flex items-center justify-center svelte-1elxaub">`);
				dateSection($$renderer);
				$$renderer.push(`<!----></div> <!--[-->`);

				const each_array_1 = $.ensure_array_like([1, 2, 3, 4, 5]);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let index = each_array_1[$$index_1];

					$$renderer.push(`<div class="h-12 flex items-center justify-center whitespace-nowrap text-gray-500 dark:text-gray-400 text-base svelte-1elxaub">`);

					if (index === 1) {
						$$renderer.push(`<!--[0-->${$.escape(lastUpdatedText || getLastUpdated())}`);
					} else if (index === 2) {
						$$renderer.push('<!--[1-->');

						if (nextUpdateIsSoon) {
							$$renderer.push(`<!--[0-->${$.escape(s('time.nextUpdate.soon') || 'Next update: soon')}`);
						} else if (nextUpdateText) {
							$$renderer.push(`<!--[1-->${$.escape(s('time.nextUpdate.in', { time: nextUpdateText }) || `Next update in ${nextUpdateText}`)}`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else if (index === 3) {
						$$renderer.push(`<!--[2-->${$.escape(s('stats.newsToday', { count: totalReadCount.toString() }) || `News today: ${totalReadCount}`)}`);
					} else if (index === 4) {
						$$renderer.push('<!--[3-->');

						if (totalStoriesRead === 1) {
							$$renderer.push(`<!--[0-->${$.escape(s('stats.storyRead', { count: totalStoriesRead.toString() }) || `Story read: ${totalStoriesRead}`)}`);
						} else {
							$$renderer.push(`<!--[-1-->${$.escape(s('stats.storiesRead', { count: totalStoriesRead.toString() }) || `Stories read: ${totalStoriesRead}`)}`);
						}

						$$renderer.push(`<!--]-->`);
					} else if (index === 5) {
						$$renderer.push(`<!--[4-->${$.escape((() => {
							const now = new Date();
							const start = new Date(now.getFullYear(), 0, 1);
							const week = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
							const day = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

							return s('stats.weekDay', { week: week.toString(), day: day.toString() }) || `Week ${week}, Day ${day}`;
						})())}`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
				dateSection($$renderer);
			}

			$$renderer.push(`<!--]--></div> <div class="ms-auto flex items-center gap-1.5 sm:gap-2 svelte-1elxaub">`);

			if (isSubscriber() && experimental.showChaosIndex && chaosIndex && chaosIndex.score > 0) {
				$$renderer.push(`<!--[0--><div class="hidden sm:block svelte-1elxaub">`);

				ChaosIndex($$renderer, {
					score: chaosIndex.score,
					summary: chaosIndex.summary,
					lastUpdated: chaosIndex.lastUpdated,
					onOpenChange: onChaosModalChange,
					get open() {
						return chaosModalOpen;
					},

					set open($$value) {
						chaosModalOpen = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button${$.attr('title', s("header.timeTravel") || "Time Travel")}${$.attr('aria-label', s("header.timeTravel") || "Time Travel")} class="p-1 sm:w-8 sm:h-8 sm:flex sm:items-center sm:justify-center sm:rounded-lg sm:hover:bg-gray-100 sm:dark:hover:bg-gray-800 svelte-1elxaub" type="button">`);

			IconClock($$renderer, {
				size: 24,
				stroke: 1.5,
				class: 'text-gray-600 dark:text-gray-400'
			});

			$$renderer.push(`<!----></button> <button${$.attr('title', searchTooltip())}${$.attr('aria-label', s("header.search") || "Search")} class="p-1 sm:w-8 sm:h-8 sm:flex sm:items-center sm:justify-center sm:rounded-lg sm:hover:bg-gray-100 sm:dark:hover:bg-gray-800 svelte-1elxaub" type="button">`);

			IconSearch($$renderer, {
				size: 24,
				stroke: 1.5,
				class: 'text-gray-600 dark:text-gray-400'
			});

			$$renderer.push(`<!----></button> <button${$.attr('title', s("header.fontSize") || "Font Size")}${$.attr('aria-label', s("header.fontSize") || "Font Size")} class="p-1 sm:w-8 sm:h-8 sm:flex sm:items-center sm:justify-center sm:rounded-lg sm:hover:bg-gray-100 sm:dark:hover:bg-gray-800 svelte-1elxaub" type="button">`);

			IconTextSize($$renderer, {
				size: 24,
				stroke: 1.5,
				class: 'text-gray-600 dark:text-gray-400'
			});

			$$renderer.push(`<!----></button> <button${$.attr('title', s("header.settings") || "Settings")}${$.attr('aria-label', s("header.settings") || "Settings")} class="p-1 sm:w-8 sm:h-8 sm:flex sm:items-center sm:justify-center sm:rounded-lg sm:hover:bg-gray-100 sm:dark:hover:bg-gray-800 svelte-1elxaub" type="button">`);

			IconSettings($$renderer, {
				size: 24,
				stroke: 1.5,
				class: 'text-gray-600 dark:text-gray-400'
			});

			$$renderer.push(`<!----></button> <div class="h-[25px] flex items-center justify-center svelte-1elxaub"><div class="w-px h-full bg-gray-200 dark:bg-gray-700 svelte-1elxaub"></div></div> `);
			AppNavigation($$renderer, {});
			$$renderer.push(`<!----></div></div></header> `);

			if (showFlyingKite) {
				$$renderer.push(`<!--[0--><div class="flying-kite-container svelte-1elxaub"${$.attr_style(`left: ${$.stringify(kiteStartPosition.x)}px; top: ${$.stringify(kiteStartPosition.y)}px;`)}><img${$.attr('src', themeSettings.isDark ? "/svg/kite_dark.svg" : "/svg/kite.svg")} alt="" class="flying-kite svelte-1elxaub" aria-hidden="true"/></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { chaosModalOpen });
	});
}