import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import Portal from 'svelte-portal';
import { s } from '$lib/client/localization.svelte';
import { languageSettings } from '$lib/data/settings.svelte.js';
import { timeTravelNavigationService } from '$lib/services/timeTravelNavigationService';
import { timeTravel } from '$lib/stores/timeTravel.svelte.js';
import { createModalBehavior } from '$lib/utils/modalBehavior.svelte';
import BetaLabel from './BetaLabel.svelte';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<option> </option>`);
var root_2 = $.from_html(`<select class="text-base font-semibold text-gray-900 dark:text-white bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"></select>`);
var root_3 = $.from_html(`<button class="text-base font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"> </button>`);
var root_4 = $.from_html(`<div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 dark:border-gray-600 dark:border-t-blue-400"></div>`);
var root_5 = $.from_html(`<div class="flex justify-center items-center h-64"><div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-400"></div></div>`);
var root_6 = $.from_html(`<div class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"> </div>`);
var root_7 = $.from_html(`<div class="size-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>`);
var root_8 = $.from_html(`<div class="flex gap-0.5 mt-0.5"></div>`);
var root_9 = $.from_html(`<button><span> </span> <!></button>`);
var root_10 = $.from_html(`<div class="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3"><div class="grid grid-cols-7 gap-1"><!> <!></div></div> <p class="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center"> </p>`, 1);
var root_11 = $.from_html(`<div class="flex items-center justify-between mb-5"><button><svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button> <div class="flex items-center gap-2"><!> <!></div> <button><svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button></div> <div class="flex justify-center mb-5"><button class="px-4 py-2 text-sm font-medium rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"> </button></div> <!>`, 1);
var root_12 = $.from_html(`<span class="text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full"> </span>`);
var root_13 = $.from_html(`<button class="w-full p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-start group"><div class="flex justify-between items-center"><div class="flex-1"><div class="flex items-center gap-2 mb-1"><svg class="size-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="font-medium text-gray-900 dark:text-white"> </span> <!></div> <div class="text-sm text-gray-500 dark:text-gray-400"> </div></div> <svg class="size-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></div></button>`);
var root_14 = $.from_html(`<button class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 -ms-1 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> </button> <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1"> </h3> <p class="text-sm text-gray-500 dark:text-gray-400 mb-4"> </p> <div class="space-y-2"></div>`, 1);
var root_15 = $.from_html(`<div class="fixed inset-0 z-modal flex items-end justify-center bg-black/50 md:items-center md:p-4" role="dialog" aria-modal="true" aria-labelledby="time-travel-title" tabindex="-1"><div class="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-xl md:h-auto md:max-h-[90vh] md:max-w-md md:rounded-lg dark:bg-gray-800"><div class="flex shrink-0 flex-col border-b border-gray-200 px-6 py-4 dark:border-gray-700"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><h2 id="time-travel-title" class="text-lg font-semibold text-gray-900 dark:text-white"> </h2> <!></div> <button class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus-visible-ring touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="mt-2 text-sm text-gray-500 dark:text-gray-400 space-y-1"></div></div> <div class="flex-1 overflow-y-auto p-6"><!></div></div></div>`);

export default function TimeTravel($$anchor, $$props) {
	$.push($$props, true);

	// Modal behavior
	const modal = createModalBehavior();

	// Component state
	let currentMonth = $.state($.proxy(new Date()));

	let loading = $.state(false);
	let monthBatches = $.state($.proxy({}));
	let selectedDayBatches = $.state($.proxy([]));
	let showBatchSelector = $.state(false);
	let showYearPicker = $.state(false);

	// Define reasonable date boundaries
	const MIN_DATE = new Date(2024, 0, 1); // January 1, 2024

	const MAX_DATE = new Date(); // Today

	// Set MAX_DATE to end of today to avoid timezone issues
	MAX_DATE.setHours(23, 59, 59, 999);

	// Calculate calendar days
	const calendarDays = $.derived(() => {
		const year = $.get(currentMonth).getFullYear();
		const month = $.get(currentMonth).getMonth();
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
	const monthYearDisplay = $.derived(() => new Intl.DateTimeFormat(languageSettings.ui, { month: 'long', year: 'numeric' }).format($.get(currentMonth)));

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
		$.set(loading, true);

		try {
			const startOfMonth = new Date($.get(currentMonth).getFullYear(), $.get(currentMonth).getMonth(), 1);
			const endOfMonth = new Date($.get(currentMonth).getFullYear(), $.get(currentMonth).getMonth() + 1, 0, 23, 59, 59);
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

			$.set(monthBatches, grouped, true);
		} catch(error) {
			console.error('Error loading batches:', error);
		} finally {
			$.set(loading, false);
		}
	}

	// Check if a date has batches
	function hasBatches(date) {
		const dateKey = date.toISOString().split('T')[0];

		return $.get(monthBatches)[dateKey] && $.get(monthBatches)[dateKey].length > 0;
	}

	// Get batch count for a date
	function getBatchCount(date) {
		const dateKey = date.toISOString().split('T')[0];

		return $.get(monthBatches)[dateKey]?.length || 0;
	}

	// Check if date is today
	function isToday(date) {
		const today = new Date();

		return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
	}

	// Check if date is in current month
	function isCurrentMonth(date) {
		return date.getMonth() === $.get(currentMonth).getMonth() && date.getFullYear() === $.get(currentMonth).getFullYear();
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
		const prevMonth = new Date($.get(currentMonth).getFullYear(), $.get(currentMonth).getMonth() - 1, 1);

		return prevMonth >= MIN_DATE;
	}

	function canNavigateNext() {
		const nextMonth = new Date($.get(currentMonth).getFullYear(), $.get(currentMonth).getMonth() + 1, 1);

		return nextMonth <= MAX_DATE;
	}

	// Navigate months
	function previousMonth() {
		if (!canNavigatePrevious()) return;

		$.set(currentMonth, new Date($.get(currentMonth).getFullYear(), $.get(currentMonth).getMonth() - 1, 1), true);
		loadMonthBatches();
	}

	function nextMonth() {
		if (!canNavigateNext()) return;

		$.set(currentMonth, new Date($.get(currentMonth).getFullYear(), $.get(currentMonth).getMonth() + 1, 1), true);
		loadMonthBatches();
	}

	async function goToToday() {
		timeTravel.close();
		await timeTravelNavigationService.exitTimeTravel();
	}

	// Year picker
	function selectYear(year) {
		$.set(currentMonth, new Date(year, $.get(currentMonth).getMonth(), 1), true);

		if ($.get(currentMonth) < MIN_DATE) {
			$.set(currentMonth, new Date(MIN_DATE), true);
		} else if ($.get(currentMonth) > MAX_DATE) {
			$.set(currentMonth, new Date(MAX_DATE.getFullYear(), MAX_DATE.getMonth(), 1), true);
		}

		$.set(showYearPicker, false);
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
			const batches = $.get(monthBatches)[dateKey];

			if (batches && batches.length === 1) {
				selectBatch(batches[0]);
			} else if (batches && batches.length > 1) {
				$.set(selectedDayBatches, batches, true);
				$.set(showBatchSelector, true);
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

	// Apply scroll lock
	$.user_effect(() => {
		if (timeTravel.isOpen) {
			return modal.applyScrollLock();
		}
	});

	// Load batches when modal opens
	$.user_effect(() => {
		if (timeTravel.isOpen) {
			$.set(showBatchSelector, false);
			loadMonthBatches();
		}
	});

	var fragment = $.comment();

	$.event('keydown', $.window, (e) => modal.handleKeydown(e, timeTravel.isOpen, closeModal));

	var node = $.first_child(fragment);

	{
		var consequent_6 = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root_15();
					var div_1 = $.child(div);
					var div_2 = $.child(div_1);
					var div_3 = $.child(div_2);
					var div_4 = $.child(div_3);
					var h2 = $.child(div_4);
					var text = $.only_child(h2, true);
					var node_1 = $.sibling(h2, 2);

					BetaLabel(node_1, {});
					$.reset(div_4);

					var button = $.sibling(div_4, 2);

					$.reset(div_3);

					var div_5 = $.sibling(div_3, 2);

					$.each(div_5, 21, () => (s("timeTravel.description") || "Access historical daily summaries.\nReserved for Kagi subscribers.\nAvailable to all users during Beta.").split('\n'), $.index, ($$anchor, line) => {
						var p = root();
						var text_1 = $.only_child(p, true);

						$.template_effect(() => $.set_text(text_1, $.get(line)));
						$.append($$anchor, p);
					});

					$.reset(div_5);
					$.reset(div_2);

					var div_6 = $.sibling(div_2, 2);
					var node_2 = $.child(div_6);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_2 = root_11();
							var div_7 = $.first_child(fragment_2);
							var button_1 = $.child(div_7);
							var div_8 = $.sibling(button_1, 2);
							var node_3 = $.child(div_8);

							{
								var consequent = ($$anchor) => {
									var select = root_2();

									$.each(select, 21, () => $.get(availableYears), $.index, ($$anchor, year) => {
										var option = root_1();
										var text_2 = $.only_child(option, true);
										var option_value = {};

										$.template_effect(() => {
											$.set_text(text_2, $.get(year));

											if (option_value !== (option_value = $.get(year))) {
												option.value = (option.__value = option_value) ?? '';
											}
										});

										$.append($$anchor, option);
									});

									$.reset(select);

									var select_value;

									$.init_select(select);

									$.template_effect(
										($0) => {
											if (select_value !== (select_value = $0)) {
												(
													select.value = (select.__value = select_value) ?? '',
													$.select_option(select, select_value)
												);
											}
										},
										[() => $.get(currentMonth).getFullYear()]
									);

									$.delegated('change', select, (e) => selectYear(parseInt(e.currentTarget.value)));
									$.event('blur', select, () => $.set(showYearPicker, false));
									$.append($$anchor, select);
								};

								var alternate = ($$anchor) => {
									var button_2 = root_3();
									var text_3 = $.only_child(button_2, true);

									$.template_effect(() => $.set_text(text_3, $.get(monthYearDisplay)));
									$.delegated('click', button_2, () => $.set(showYearPicker, true));
									$.append($$anchor, button_2);
								};

								$.if(node_3, ($$render) => {
									if ($.get(showYearPicker)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							var node_4 = $.sibling(node_3, 2);

							{
								var consequent_1 = ($$anchor) => {
									var div_9 = root_4();

									$.append($$anchor, div_9);
								};

								$.if(node_4, ($$render) => {
									if ($.get(loading)) $$render(consequent_1);
								});
							}

							$.reset(div_8);

							var button_3 = $.sibling(div_8, 2);

							$.reset(div_7);

							var div_10 = $.sibling(div_7, 2);
							var button_4 = $.child(div_10);
							var text_4 = $.only_child(button_4, true);

							$.reset(div_10);

							var node_5 = $.sibling(div_10, 2);

							{
								var consequent_2 = ($$anchor) => {
									var div_11 = root_5();

									$.append($$anchor, div_11);
								};

								var alternate_1 = ($$anchor) => {
									var fragment_3 = root_10();
									var div_12 = $.first_child(fragment_3);
									var div_13 = $.child(div_12);
									var node_6 = $.child(div_13);

									$.each(node_6, 17, () => $.get(weekdayHeaders), $.index, ($$anchor, day) => {
										var div_14 = root_6();
										var text_5 = $.only_child(div_14, true);

										$.template_effect(() => $.set_text(text_5, $.get(day)));
										$.append($$anchor, div_14);
									});

									var node_7 = $.sibling(node_6, 2);

									$.each(node_7, 17, () => $.get(calendarDays), $.index, ($$anchor, date) => {
										const hasBatch = $.derived(() => hasBatches($.get(date)));
										const batchCount = $.derived(() => getBatchCount($.get(date)));
										const today = $.derived(() => isToday($.get(date)));
										const inCurrentMonth = $.derived(() => isCurrentMonth($.get(date)));
										const inRange = $.derived(() => isDateInRange($.get(date)));
										var button_5 = root_9();
										var span = $.child(button_5);
										var text_6 = $.only_child(span, true);
										var node_8 = $.sibling(span, 2);

										{
											var consequent_3 = ($$anchor) => {
												var div_15 = root_8();

												$.each(div_15, 21, () => Array(Math.min($.get(batchCount), 3)), $.index, ($$anchor, _) => {
													var div_16 = root_7();

													$.append($$anchor, div_16);
												});

												$.reset(div_15);
												$.append($$anchor, div_15);
											};

											$.if(node_8, ($$render) => {
												if ($.get(hasBatch) && $.get(inRange)) $$render(consequent_3);
											});
										}

										$.reset(button_5);

										$.template_effect(
											($0, $1) => {
												button_5.disabled = !$.get(hasBatch) || !$.get(inRange);

												$.set_class(button_5, 1, `relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all
                        ${$.get(hasBatch) && $.get(inRange)
													? 'hover:bg-white dark:hover:bg-gray-700 cursor-pointer'
													: 'cursor-default'}
                        ${$.get(today)
													? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-inset'
													: ''}
                        ${!$.get(inCurrentMonth) || !$.get(inRange) ? 'opacity-40' : ''}`);

												$.set_attribute(button_5, 'aria-label', `${$0 ?? ''} - ${$.get(batchCount) ?? ''} batches`);

												$.set_class(span, 1, `text-sm ${$.get(hasBatch) && $.get(inRange)
													? 'font-medium text-gray-900 dark:text-white'
													: 'text-gray-400 dark:text-gray-500'}`);

												$.set_text(text_6, $1);
											},
											[() => $.get(date).getDate(), () => $.get(date).getDate()]
										);

										$.delegated('click', button_5, () => selectDay($.get(date)));
										$.append($$anchor, button_5);
									});

									$.reset(div_13);
									$.reset(div_12);

									var p_1 = $.sibling(div_12, 2);
									var text_7 = $.only_child(p_1, true);

									$.template_effect(($0) => $.set_text(text_7, $0), [
										() => s("timeTravel.selectDate") || "Select a date to view news from that day"
									]);

									$.append($$anchor, fragment_3);
								};

								$.if(node_5, ($$render) => {
									if ($.get(loading)) $$render(consequent_2); else $$render(alternate_1, -1);
								});
							}

							$.template_effect(
								($0, $1, $2, $3, $4, $5, $6) => {
									button_1.disabled = $0;
									$.set_class(button_1, 1, `rounded-full p-2 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${$1 ?? ''}`);
									$.set_attribute(button_1, 'aria-label', $2);
									button_3.disabled = $3;
									$.set_class(button_3, 1, `rounded-full p-2 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${$4 ?? ''}`);
									$.set_attribute(button_3, 'aria-label', $5);
									$.set_text(text_4, $6);
								},
								[
									() => !canNavigatePrevious(),
									() => canNavigatePrevious()
										? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
										: 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
									() => s("timeTravel.previousMonth") || "Previous month",
									() => !canNavigateNext(),
									() => canNavigateNext()
										? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
										: 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
									() => s("timeTravel.nextMonth") || "Next month",
									() => s("timeTravel.today") || "Go to Today"
								]
							);

							$.delegated('click', button_1, previousMonth);
							$.delegated('click', button_3, nextMonth);
							$.delegated('click', button_4, goToToday);
							$.append($$anchor, fragment_2);
						};

						var alternate_2 = ($$anchor) => {
							const selectedDate = $.derived(() => $.get(selectedDayBatches)[0]
								? new Date($.get(selectedDayBatches)[0].createdAt)
								: new Date());

							const dateStr = $.derived(() => new Intl.DateTimeFormat(languageSettings.ui, {
								weekday: "long",
								month: "long",
								day: "numeric",
								year: "numeric"
							}).format($.get(selectedDate)));

							var fragment_4 = root_14();
							var button_6 = $.first_child(fragment_4);
							var text_8 = $.sibling($.child(button_6));

							$.reset(button_6);

							var h3 = $.sibling(button_6, 2);
							var text_9 = $.only_child(h3, true);
							var p_2 = $.sibling(h3, 2);
							var text_10 = $.only_child(p_2, true);
							var div_17 = $.sibling(p_2, 2);

							$.each(div_17, 21, () => $.get(selectedDayBatches), $.index, ($$anchor, batch, index) => {
								const batchDate = $.derived(() => new Date($.get(batch).createdAt));
								const timeStr = $.derived(() => $.get(batchDate).toLocaleTimeString(languageSettings.ui, { hour: "2-digit", minute: "2-digit", hour12: true }));
								var button_7 = root_13();
								var div_18 = $.child(button_7);
								var div_19 = $.child(div_18);
								var div_20 = $.child(div_19);
								var span_1 = $.sibling($.child(div_20), 2);
								var text_11 = $.only_child(span_1, true);
								var node_9 = $.sibling(span_1, 2);

								{
									var consequent_5 = ($$anchor) => {
										var span_2 = root_12();
										var text_12 = $.only_child(span_2, true);

										$.template_effect(($0) => $.set_text(text_12, $0), [() => s("timeTravel.latest") || "Latest"]);
										$.append($$anchor, span_2);
									};

									$.if(node_9, ($$render) => {
										if (index === 0) $$render(consequent_5);
									});
								}

								$.reset(div_20);

								var div_21 = $.sibling(div_20, 2);
								var text_13 = $.only_child(div_21);

								$.reset(div_19);
								$.next(2);
								$.reset(div_18);
								$.reset(button_7);

								$.template_effect(
									($0) => {
										$.set_text(text_11, $.get(timeStr));
										$.set_text(text_13, `${$.get(batch).totalStories ?? ''} ${$0 ?? ''}`);
									},
									[() => s("timeTravel.stories") || "stories"]
								);

								$.delegated('click', button_7, () => selectBatch($.get(batch)));
								$.append($$anchor, button_7);
							});

							$.reset(div_17);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_8, ` ${$0 ?? ''}`);
									$.set_text(text_9, $.get(dateStr));
									$.set_text(text_10, $1);
								},
								[
									() => s("common.back") || "Back",
									() => s("timeTravel.selectBatch") || "Select a news update"
								]
							);

							$.delegated('click', button_6, () => $.set(showBatchSelector, false));
							$.append($$anchor, fragment_4);
						};

						$.if(node_2, ($$render) => {
							if (!$.get(showBatchSelector)) $$render(consequent_4); else $$render(alternate_2, -1);
						});
					}

					$.reset(div_6);
					$.reset(div_1);
					$.reset(div);

					$.template_effect(
						($0, $1) => {
							$.set_text(text, $0);
							$.set_attribute(button, 'aria-label', $1);
						},
						[
							() => s("timeTravel.title") || "Time Travel",
							() => s("ui.close") || "Close"
						]
					);

					$.delegated('click', div, (e) => modal.handleBackdropClick(e, closeModal));
					$.delegated('keydown', div, (e) => e.key === 'Escape' && closeModal());
					$.delegated('click', button, closeModal);
					$.transition(3, div_1, () => fade, () => ({ duration: modal.getTransitionDuration() }));
					$.transition(3, div, () => fade, () => ({ duration: modal.getTransitionDuration() }));
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (timeTravel.isOpen) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown', 'change']);