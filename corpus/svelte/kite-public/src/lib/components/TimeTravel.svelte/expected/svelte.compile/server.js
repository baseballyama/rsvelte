import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import Portal from 'svelte-portal';
import { s } from '$lib/client/localization.svelte';
import { languageSettings } from '$lib/data/settings.svelte.js';
import { timeTravelNavigationService } from '$lib/services/timeTravelNavigationService';
import { timeTravel } from '$lib/stores/timeTravel.svelte.js';
import { createModalBehavior } from '$lib/utils/modalBehavior.svelte';
import BetaLabel from './BetaLabel.svelte';

export default function TimeTravel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Modal behavior
		const modal = createModalBehavior();

		// Component state
		let currentMonth = new Date();

		let loading = false;
		let monthBatches = {};
		let selectedDayBatches = [];
		let showBatchSelector = false;
		let showYearPicker = false;

		// Define reasonable date boundaries
		const MIN_DATE = new Date(2024, 0, 1); // January 1, 2024

		const MAX_DATE = new Date(); // Today

		// Set MAX_DATE to end of today to avoid timezone issues
		MAX_DATE.setHours(23, 59, 59, 999);

		// Calculate calendar days
		const calendarDays = $.derived(() => {
			const year = currentMonth.getFullYear();
			const month = currentMonth.getMonth();
			const firstDay = new Date(year, month, 1, 12, 0, 0); // Set to noon to avoid timezone issues
			const lastDay = new Date(year, month + 1, 0, 12, 0, 0);
			const startDate = new Date(firstDay);

			startDate.setDate(startDate.getDate() - firstDay.getDay());

			const days = [];
			const endDate = new Date(lastDay);

			endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

			for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
				// Create a new date at noon to avoid timezone issues
				const dayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);

				days.push(dayDate);
			}

			return days;
		});

		// Month/year display
		const monthYearDisplay = $.derived(() => new Intl.DateTimeFormat(languageSettings.ui, { month: 'long', year: 'numeric' }).format(currentMonth));

		// Weekday headers
		const weekdayHeaders = $.derived(() => {
			const formatter = new Intl.DateTimeFormat(languageSettings.ui, { weekday: 'short' });
			const days = [];

			for (let i = 0; i < 7; i++) {
				const date = new Date(2024, 0, i + 7); // Start from Sunday

				days.push(formatter.format(date));
			}

			return days;
		});

		// Load batches for current month
		async function loadMonthBatches() {
			loading = true;

			try {
				const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
				const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);
				const lang = languageSettings.getLanguageForAPI();
				const response = await fetch(`/api/batches?from=${startOfMonth.toISOString()}&to=${endOfMonth.toISOString()}&lang=${lang}`);

				if (!response.ok) throw new Error('Failed to load batches');

				const data = await response.json();

				// Group batches by date
				const grouped = {};

				for (const batch of data.batches) {
					const date = new Date(batch.createdAt);
					const dateKey = date.toISOString().split('T')[0];
					const timeStr = date.toLocaleTimeString(languageSettings.ui, { hour: '2-digit', minute: '2-digit' });

					if (!grouped[dateKey]) {
						grouped[dateKey] = [];
					}

					grouped[dateKey].push({
						id: batch.id,
						createdAt: batch.createdAt,
						language: batch.language,
						totalStories: batch.totalClusters,
						time: timeStr,
						dateSlug: batch.dateSlug
					});
				}

				// Sort batches within each day by time (newest first)
				for (const dateKey in grouped) {
					grouped[dateKey].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
				}

				monthBatches = grouped;
			} catch(error) {
				console.error('Error loading batches:', error);
			} finally {
				loading = false;
			}
		}

		// Check if a date has batches
		function hasBatches(date) {
			const dateKey = date.toISOString().split('T')[0];

			return monthBatches[dateKey] && monthBatches[dateKey].length > 0;
		}

		// Get batch count for a date
		function getBatchCount(date) {
			const dateKey = date.toISOString().split('T')[0];

			return monthBatches[dateKey]?.length || 0;
		}

		// Check if date is today
		function isToday(date) {
			const today = new Date();

			return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
		}

		// Check if date is in current month
		function isCurrentMonth(date) {
			return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
		}

		// Check if date is within allowed range
		function isDateInRange(date) {
			const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			const minDateOnly = new Date(MIN_DATE.getFullYear(), MIN_DATE.getMonth(), MIN_DATE.getDate());
			const maxDateOnly = new Date(MAX_DATE.getFullYear(), MAX_DATE.getMonth(), MAX_DATE.getDate());

			return dateOnly >= minDateOnly && dateOnly <= maxDateOnly;
		}

		// Check if we can navigate
		function canNavigatePrevious() {
			const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);

			return prevMonth >= MIN_DATE;
		}

		function canNavigateNext() {
			const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

			return nextMonth <= MAX_DATE;
		}

		// Navigate months
		function previousMonth() {
			if (!canNavigatePrevious()) return;

			currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
			loadMonthBatches();
		}

		function nextMonth() {
			if (!canNavigateNext()) return;

			currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
			loadMonthBatches();
		}

		async function goToToday() {
			timeTravel.close();
			await timeTravelNavigationService.exitTimeTravel();
		}

		// Year picker
		function selectYear(year) {
			currentMonth = new Date(year, currentMonth.getMonth(), 1);

			if (currentMonth < MIN_DATE) {
				currentMonth = new Date(MIN_DATE);
			} else if (currentMonth > MAX_DATE) {
				currentMonth = new Date(MAX_DATE.getFullYear(), MAX_DATE.getMonth(), 1);
			}

			showYearPicker = false;
			loadMonthBatches();
		}

		// Get available years
		const availableYears = $.derived(() => {
			const years = [];

			for (let year = MIN_DATE.getFullYear(); year <= MAX_DATE.getFullYear(); year++) {
				years.push(year);
			}

			return years;
		});

		// Handle day selection
		function selectDay(date) {
			try {
				const dateKey = date.toISOString().split('T')[0];
				const batches = monthBatches[dateKey];

				if (batches && batches.length === 1) {
					selectBatch(batches[0]);
				} else if (batches && batches.length > 1) {
					selectedDayBatches = batches;
					showBatchSelector = true;
				}
			} catch(error) {
				console.error('Error in selectDay:', error);
			}
		}

		// Select a specific batch
		async function selectBatch(batch) {
			timeTravel.close();

			try {
				const lang = languageSettings.getLanguageForAPI();
				const latestResponse = await fetch(`/api/batches/latest?lang=${lang}`);
				const latestData = await latestResponse.json();
				const isLatestBatch = latestData.id && latestData.id === batch.id;

				if (isLatestBatch) {
					await timeTravelNavigationService.exitTimeTravel();
				} else {
					await timeTravelNavigationService.enterTimeTravel({
						batchId: batch.id,
						batchDate: batch.createdAt,
						dateSlug: batch.dateSlug,
						reload: true
					});
				}
			} catch(error) {
				console.error('Error selecting batch:', error);
			}
		}

		function closeModal() {
			timeTravel.close();
		}

		if (// Apply scroll lock
		// Load batches when modal opens
		timeTravel.isOpen) {
			$$renderer.push('<!--[0-->');

			Portal($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="fixed inset-0 z-modal flex items-end justify-center bg-black/50 md:items-center md:p-4" role="dialog" aria-modal="true" aria-labelledby="time-travel-title" tabindex="-1"><div class="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-xl md:h-auto md:max-h-[90vh] md:max-w-md md:rounded-lg dark:bg-gray-800"><div class="flex shrink-0 flex-col border-b border-gray-200 px-6 py-4 dark:border-gray-700"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><h2 id="time-travel-title" class="text-lg font-semibold text-gray-900 dark:text-white">${$.escape(s("timeTravel.title") || "Time Travel")}</h2> `);
					BetaLabel($$renderer, {});
					$$renderer.push(`<!----></div> <button class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus-visible-ring touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"${$.attr('aria-label', s("ui.close") || "Close")}><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="mt-2 text-sm text-gray-500 dark:text-gray-400 space-y-1"><!--[-->`);

					const each_array = $.ensure_array_like((s("timeTravel.description") || "Access historical daily summaries.\nReserved for Kagi subscribers.\nAvailable to all users during Beta.").split('\n'));

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let line = each_array[$$index];

						$$renderer.push(`<p>${$.escape(line)}</p>`);
					}

					$$renderer.push(`<!--]--></div></div> <div class="flex-1 overflow-y-auto p-6">`);

					if (!showBatchSelector) {
						$$renderer.push(`<!--[0--><div class="flex items-center justify-between mb-5"><button${$.attr('disabled', !canNavigatePrevious(), true)}${$.attr_class(`rounded-full p-2 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${canNavigatePrevious()
							? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
							: 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`)}${$.attr('aria-label', s("timeTravel.previousMonth") || "Previous month")}><svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button> <div class="flex items-center gap-2">`);

						if (showYearPicker) {
							$$renderer.push('<!--[0-->');

							$$renderer.select(
								{
									class: 'text-base font-semibold text-gray-900 dark:text-white bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500',
									value: currentMonth.getFullYear(),
									onchange: (e) => selectYear(parseInt(e.currentTarget.value)),
									onblur: () => showYearPicker = false
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(availableYears());

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let year = each_array_1[$$index_1];

										$$renderer.option({ value: year }, ($$renderer) => {
											$$renderer.push(`${$.escape(year)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								}
							);
						} else {
							$$renderer.push(`<!--[-1--><button class="text-base font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">${$.escape(monthYearDisplay())}</button>`);
						}

						$$renderer.push(`<!--]--> `);

						if (loading) {
							$$renderer.push(`<!--[0--><div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 dark:border-gray-600 dark:border-t-blue-400"></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <button${$.attr('disabled', !canNavigateNext(), true)}${$.attr_class(`rounded-full p-2 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${canNavigateNext()
							? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
							: 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`)}${$.attr('aria-label', s("timeTravel.nextMonth") || "Next month")}><svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button></div> <div class="flex justify-center mb-5"><button class="px-4 py-2 text-sm font-medium rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">${$.escape(s("timeTravel.today") || "Go to Today")}</button></div> `);

						if (loading) {
							$$renderer.push(`<!--[0--><div class="flex justify-center items-center h-64"><div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-400"></div></div>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3"><div class="grid grid-cols-7 gap-1"><!--[-->`);

							const each_array_2 = $.ensure_array_like(weekdayHeaders());

							for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
								let day = each_array_2[$$index_2];

								$$renderer.push(`<div class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">${$.escape(day)}</div>`);
							}

							$$renderer.push(`<!--]--> <!--[-->`);

							const each_array_3 = $.ensure_array_like(calendarDays());

							for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
								let date = each_array_3[$$index_4];
								const hasBatch = hasBatches(date);
								const batchCount = getBatchCount(date);
								const today = isToday(date);
								const inCurrentMonth = isCurrentMonth(date);
								const inRange = isDateInRange(date);

								$$renderer.push(`<button${$.attr('disabled', !hasBatch || !inRange, true)}${$.attr_class(`relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${hasBatch && inRange
									? 'hover:bg-white dark:hover:bg-gray-700 cursor-pointer'
									: 'cursor-default'} ${today
									? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-inset'
									: ''} ${!inCurrentMonth || !inRange ? 'opacity-40' : ''}`)}${$.attr('aria-label', `${$.stringify(date.getDate())} - ${$.stringify(batchCount)} batches`)}><span${$.attr_class(`text-sm ${hasBatch && inRange
									? 'font-medium text-gray-900 dark:text-white'
									: 'text-gray-400 dark:text-gray-500'}`)}>${$.escape(date.getDate())}</span> `);

								if (hasBatch && inRange) {
									$$renderer.push(`<!--[0--><div class="flex gap-0.5 mt-0.5"><!--[-->`);

									const each_array_4 = $.ensure_array_like(Array(Math.min(batchCount, 3)));

									for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
										let _ = each_array_4[$$index_3];

										$$renderer.push(`<div class="size-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>`);
									}

									$$renderer.push(`<!--]--></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></button>`);
							}

							$$renderer.push(`<!--]--></div></div> <p class="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">${$.escape(s("timeTravel.selectDate") || "Select a date to view news from that day")}</p>`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');

						const selectedDate = selectedDayBatches[0]
							? new Date(selectedDayBatches[0].createdAt)
							: new Date();

						const dateStr = new Intl.DateTimeFormat(languageSettings.ui, {
							weekday: "long",
							month: "long",
							day: "numeric",
							year: "numeric"
						}).format(selectedDate);

						$$renderer.push(`<button class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 -ms-1 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> ${$.escape(s("common.back") || "Back")}</button> <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">${$.escape(dateStr)}</h3> <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">${$.escape(s("timeTravel.selectBatch") || "Select a news update")}</p> <div class="space-y-2"><!--[-->`);

						const each_array_5 = $.ensure_array_like(selectedDayBatches);

						for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
							let batch = each_array_5[index];
							const batchDate = new Date(batch.createdAt);
							const timeStr = batchDate.toLocaleTimeString(languageSettings.ui, { hour: "2-digit", minute: "2-digit", hour12: true });

							$$renderer.push(`<button class="w-full p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-start group"><div class="flex justify-between items-center"><div class="flex-1"><div class="flex items-center gap-2 mb-1"><svg class="size-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="font-medium text-gray-900 dark:text-white">${$.escape(timeStr)}</span> `);

							if (index === 0) {
								$$renderer.push(`<!--[0--><span class="text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">${$.escape(s("timeTravel.latest") || "Latest")}</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> <div class="text-sm text-gray-500 dark:text-gray-400">${$.escape(batch.totalStories)} ${$.escape(s("timeTravel.stories") || "stories")}</div></div> <svg class="size-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></div></button>`);
						}

						$$renderer.push(`<!--]--></div>`);
					}

					$$renderer.push(`<!--]--></div></div></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}