import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import clsx from "clsx";
import Button from "$lib/buttons/Button.svelte";
import ToolbarButton from "$lib/toolbar/ToolbarButton.svelte";
import { datepicker } from "./theme";

import {
	parse,
	isValid,
	addDays,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	eachDayOfInterval,
	isSameDay,
	isWithinInterval
} from "date-fns";

import { getTheme } from "$lib/theme/themeUtils";

export default function Datepicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			defaultDate = null,
			range = false,
			rangeFrom = void 0,
			rangeTo = void 0,
			availableFrom = null,
			availableTo = null,
			locale = "default",
			translationLocale,
			firstDayOfWeek = 0,
			dateFormat,
			placeholder = "Select date",
			disabled = false,
			required = false,
			inputClass = "",
			color = "primary",
			inline = false,
			autohide = true,
			showActionButtons = false,
			title = "",
			onselect,
			onclear,
			onapply,
			btnClass,
			inputmode = "none",
			classes,
			monthColor = "alternative",
			monthBtnSelected = "bg-primary-500 text-white",
			monthBtn = "text-gray-700 dark:text-gray-300",
			class: className,
			elementRef = void 0,
			actionSlot,
			inputProps = {}
		} = $$props;

		const theme = $.derived(() => getTheme("datepicker"));

		// If translationLocale is not explicitly provided, it will default to the value of locale. This ensures reactivity as both are directly exposed as props.
		const finalTranslationLocale = $.derived(() => translationLocale ?? locale);

		let isOpen = false;
		let showMonthSelector = false;
		let datepickerContainerElement;
		let currentMonth = new Date();
		let focusedDate = null;
		let calendarRef = null;
		let daysInMonth = $.derived(() => getDaysInMonth(currentMonth));

		onMount(() => {
			if (!inline) {
				datepickerContainerElement?.ownerDocument.addEventListener("click", handleClickOutside);

				return () => {
					datepickerContainerElement?.ownerDocument.removeEventListener("click", handleClickOutside);
				};
			}
		});

		function getDaysInMonth(date) {
			const monthStart = startOfMonth(date);
			const monthEnd = endOfMonth(date);
			const calendarStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek });
			const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek });

			return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
		}

		const getWeekdayNames = () => {
			const referenceDate = new Date(1970, 0, 4 + firstDayOfWeek);

			return Array.from({ length: 7 }, (_, i) => addDays(referenceDate, i).toLocaleDateString(finalTranslationLocale(), { weekday: "short" }));
		};

		let weekdays = $.derived(getWeekdayNames);

		const getMonthNames = () => {
			return Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(finalTranslationLocale(), { month: "short" }));
		};

		let monthNames = $.derived(getMonthNames);
		const addDay = (date, increment) => addDays(date, increment);

		function changeMonth(increment) {
			currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1);
		}

		function changeYear(increment) {
			currentMonth = new Date(currentMonth.getFullYear() + increment, currentMonth.getMonth(), 1);
		}

		function selectMonth(monthIndex, event) {
			event.stopPropagation();
			currentMonth = new Date(currentMonth.getFullYear(), monthIndex, 1);
			showMonthSelector = false;
		}

		function toggleMonthSelector(event) {
			event.stopPropagation();
			showMonthSelector = !showMonthSelector;
		}

		function isDateAvailable(date) {
			const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

			if (availableFrom) {
				const fromDate = new Date(availableFrom.getFullYear(), availableFrom.getMonth(), availableFrom.getDate());

				if (dateOnly < fromDate) return false;
			}

			if (availableTo) {
				const toDate = new Date(availableTo.getFullYear(), availableTo.getMonth(), availableTo.getDate());

				if (dateOnly > toDate) return false;
			}

			return true;
		}

		function handleDaySelect(day) {
			if (!isDateAvailable(day)) return;

			if (range) {
				if (!rangeFrom || rangeFrom && rangeTo) {
					rangeFrom = day;
					rangeTo = undefined;
				} else if (day < rangeFrom) {
					const oldRangeFrom = rangeFrom;

					rangeFrom = day;
					rangeTo = oldRangeFrom;
				} else {
					rangeTo = day;
				}

				onselect?.({ from: rangeFrom, to: rangeTo });
			} else {
				value = day;
				onselect?.(value);

				if (autohide && !inline) isOpen = false;
			}
		}

		function handleInputChangeWithDateFns() {
			const inputValue = elementRef?.value?.trim();

			if (!inputValue) {
				rangeFrom = undefined;
				rangeTo = undefined;
				elementRef?.setCustomValidity("");

				return;
			}

			elementRef?.setCustomValidity("");

			if (range) {
				const parts = inputValue.split(" - ");

				if (parts.length === 2) {
					const parsedFrom = tryParseDate(parts[0]);
					const parsedTo = tryParseDate(parts[1]);

					if (parsedFrom && isValid(parsedFrom) && isDateAvailable(parsedFrom) && parsedTo && isValid(parsedTo) && isDateAvailable(parsedTo)) {
						[rangeFrom, rangeTo] = parsedFrom > parsedTo ? [parsedTo, parsedFrom] : [parsedFrom, parsedTo];
						onselect?.({ from: rangeFrom, to: rangeTo });

						return;
					} else {
						elementRef?.setCustomValidity(`Please enter date range in format: ${getDateFormatPattern()} - ${getDateFormatPattern()}`);

						return;
					}
				}
			}

			const parsedDate = tryParseDate(inputValue);

			if (!parsedDate || !isValid(parsedDate)) {
				const formatPattern = getDateFormatPattern();

				elementRef?.setCustomValidity(`Please enter date in format: ${formatPattern}`);

				return;
			}

			if (!isDateAvailable(parsedDate)) {
				elementRef?.setCustomValidity("Selected date is not available");

				return;
			}

			handleDaySelect(parsedDate);
		}

		function tryParseDate(inputValue) {
			const formatPattern = getDateFormatPattern();

			try {
				const parsedDate = parse(inputValue, formatPattern, new Date());

				if (isValid(parsedDate)) {
					return parsedDate;
				}
			} catch(error) {
				// Continue to next strategy
			}

			const commonFormats = [
				"d.M.yyyy", // German: 17.7.2025
				"dd.MM.yyyy", // German: 17.07.2025
				"M/d/yyyy", // US: 7/17/2025
				"MM/dd/yyyy", // US: 07/17/2025
				"d/M/yyyy", // UK: 17/7/2025
				"dd/MM/yyyy", // UK: 17/07/2025
				"yyyy-MM-dd", // ISO: 2025-07-17
				"yyyy-M-d", // ISO: 2025-7-17
				"M-d-yyyy", // US with dashes: 7-17-2025
				"d-M-yyyy" // EU with dashes: 17-7-2025
			];

			for (const format of commonFormats) {
				try {
					const parsedDate = parse(inputValue, format, new Date());

					if (isValid(parsedDate)) {
						return parsedDate;
					}
				} catch(error) {
					// Continue to next format
				}
			}

			try {
				const nativeDate = new Date(inputValue);

				if (isValid(nativeDate) && !isNaN(nativeDate.getTime())) {
					return nativeDate;
				}
			} catch(error) {
				// Continue
			}

			return null;
		}

		function getDateFormatPattern() {
			const actualLocale = locale === "default" ? navigator.language : locale;
			const testDate = new Date(2025, 0, 15); // January 15, 2025
			const formatted = testDate.toLocaleDateString(actualLocale, dateFormat || { year: "numeric", month: "numeric", day: "numeric" });

			if (formatted.includes(".")) {
				// German/European format with dots
				if (formatted.startsWith("15.")) {
					return "d.M.yyyy";
				} else if (formatted.startsWith("01.")) {
					return "M.d.yyyy";
				}

				return "d.M.yyyy"; // Default to day first
			} else if (formatted.includes("/")) {
				// US/UK format with slashes
				if (formatted.startsWith("1/")) {
					return "M/d/yyyy"; // US format
				} else if (formatted.startsWith("15/")) {
					return "d/M/yyyy"; // UK format
				}

				const testDate2 = new Date(2025, 11, 3); // December 3, 2025
				const formatted2 = testDate2.toLocaleDateString(actualLocale, dateFormat || { year: "numeric", month: "numeric", day: "numeric" });

				if (formatted2.startsWith("3/") || formatted2.startsWith("03/")) {
					return "d/M/yyyy";
				} else {
					return "M/d/yyyy";
				}
			} else if (formatted.includes("-")) {
				// ISO or other dash format
				if (formatted.startsWith("2025-")) {
					return "yyyy-M-d";
				} else if (formatted.startsWith("1-")) {
					return "M-d-yyyy";
				} else {
					return "d-M-yyyy";
				}
			}

			// Default fallback - try to detect based on locale
			if (actualLocale.startsWith("en-US")) {
				return "M/d/yyyy";
			} else if (actualLocale.startsWith("de") || actualLocale.startsWith("at") || actualLocale.startsWith("ch")) {
				return "d.M.yyyy";
			} else if (actualLocale.startsWith("en-GB") || actualLocale.startsWith("en-AU")) {
				return "d/M/yyyy";
			}

			return "M/d/yyyy";
		}

		function handleClickOutside(event) {
			if (isOpen && datepickerContainerElement && !datepickerContainerElement.contains(event.target)) {
				isOpen = false;
				showMonthSelector = false;
			}
		}

		// Use locale for formatting (not finalTranslationLocale)
		const formatDate = (date) => date?.toLocaleDateString(locale, dateFormat) ?? "";

		const isSameDate = (date1, date2) => date1 && date2 ? isSameDay(date1, date2) : false;
		const isToday = (day) => isSameDate(day, new Date());
		const isInRange = (day) => !!(range && rangeFrom && rangeTo && isWithinInterval(day, { start: rangeFrom, end: rangeTo }));

		let isSelected = $.derived(() => (day) => range
			? isSameDate(day, rangeFrom) || isSameDate(day, rangeTo)
			: isSameDate(day, value));

		function handleCalendarKeydown(event) {
			if (!isOpen) return;

			if (!focusedDate) {
				focusedDate = value || new Date();
			}

			switch (event.key) {
				case "ArrowLeft":
					focusedDate = addDay(focusedDate, -1);
					break;

				case "ArrowRight":
					focusedDate = addDay(focusedDate, 1);
					break;

				case "ArrowUp":
					focusedDate = addDay(focusedDate, -7);
					break;

				case "ArrowDown":
					focusedDate = addDay(focusedDate, 7);
					break;

				case "Enter":
					if (range) {
						if (rangeFrom && rangeTo) {
							if (autohide && !inline) isOpen = false;
						} else {
							handleDaySelect(focusedDate);
						}
					} else {
						handleDaySelect(focusedDate);

						if (autohide && !inline) isOpen = false;
					}
					break;

				case "Escape":
					isOpen = false;
					showMonthSelector = false;
					elementRef?.focus();
					break;

				default:
					return;
			}

			event.preventDefault();

			if (focusedDate.getMonth() !== currentMonth.getMonth()) {
				currentMonth = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1);
			}

			// Use finalTranslationLocale for aria-label
			setTimeout(
				() => {
					const focusedButton = calendarRef?.querySelector(`button[aria-label="${focusedDate.toLocaleDateString(finalTranslationLocale(), {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric"
					})}"]`);

					focusedButton?.focus();
				},
				0
			);
		}

		function handleInputKeydown(event) {
			if (event.key === "Enter") {
				event.preventDefault();
				handleInputChangeWithDateFns();

				if (autohide && !inline) {
					isOpen = false;
				}
			} else if (event.key === " ") {
				event.preventDefault();
				isOpen = !isOpen;
			}
		}

		function handleClear() {
			value = rangeFrom = rangeTo = undefined;
			onclear?.();
		}

		function handleApply() {
			const result = range ? { from: rangeFrom, to: rangeTo } : value;

			if (result) onapply?.(result);
			if (!inline) isOpen = false;
		}

		let {
			base,
			input,
			button,
			titleVariant,
			actionButtons,
			columnHeader,
			polite,
			grid,
			nav,
			dayButton,
			monthButton
		} = datepicker();

		function navButton($$renderer, forward) {
			ToolbarButton($$renderer, {
				color: 'dark',
				onclick: () => changeMonth(forward ? 1 : -1),
				size: 'lg',
				'aria-label': forward ? "Next month" : "Previous month",
				children: ($$renderer) => {
					$$renderer.push(`<svg class="h-3 w-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${$.attr('d', forward ? "M1 5h12m0 0L9 1m4 4L9 9" : "M13 5H1m0 0 4 4M1 5l4-4")}></path></svg>`);
				},
				$$slots: { default: true }
			});
		}

		function yearNavButton($$renderer, forward) {
			ToolbarButton($$renderer, {
				color: 'dark',
				onclick: () => changeYear(forward ? 1 : -1),
				size: 'lg',
				'aria-label': forward ? "Next year" : "Previous year",
				children: ($$renderer) => {
					$$renderer.push(`<svg class="h-3 w-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${$.attr('d', forward ? "M1 5h12m0 0L9 1m4 4L9 9" : "M13 5H1m0 0 4 4M1 5l4-4")}></path></svg>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<div${$.attr_class($.clsx(["relative", inline && "inline-block"]))}>`);

		if (!inline) {
			$$renderer.push(`<!--[0--><div class="relative"><input${$.attributes(
				{
					...inputProps,
					type: 'text',
					class: $.clsx(input({ color, class: clsx(theme()?.input, inputClass) })),
					placeholder,
					value: range
						? `${formatDate(rangeFrom)} - ${formatDate(rangeTo)}`
						: formatDate(value),
					disabled,
					required,
					inputmode,
					'aria-haspopup': 'dialog'
				},
				void 0,
				void 0,
				void 0,
				4
			)}/> <button type="button"${$.attr_class($.clsx(button({ class: clsx(btnClass, theme()?.button, classes?.button) })))}${$.attr('disabled', disabled, true)}${$.attr('aria-label', isOpen ? "Close date picker" : "Open date picker")}><svg class="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"></path></svg></button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (isOpen || inline) {
			$$renderer.push(`<!--[0--><div id="datepicker-dropdown"${$.attr_class($.clsx(base({ inline, class: clsx(theme()?.base, className) })))} role="dialog" aria-label="Calendar">`);

			if (title) {
				$$renderer.push(`<!--[0--><h2${$.attr_class($.clsx(titleVariant({ class: clsx(theme()?.titleVariant, classes?.titleVariant) })))}>${$.escape(title)}</h2>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showMonthSelector) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(nav({ class: clsx(theme()?.nav, classes?.nav) })))}>`);
				yearNavButton($$renderer, false);
				$$renderer.push(`<!----> <h3${$.attr_class($.clsx(polite({ class: clsx(theme()?.polite, classes?.polite) })))} aria-live="polite">${$.escape(currentMonth.getFullYear())}</h3> `);
				yearNavButton($$renderer, true);
				$$renderer.push(`<!----></div> <div class="grid grid-cols-4 gap-2 p-4"><!--[-->`);

				const each_array = $.ensure_array_like(monthNames());

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let month = each_array[index];

					Button($$renderer, {
						type: 'button',
						color: monthColor,
						class: monthButton({
							class: clsx(currentMonth.getMonth() === index ? monthBtnSelected : monthBtn, classes?.monthButton, theme()?.monthButton)
						}),
						onclick: (event) => selectMonth(index, event),
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(month)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(nav({ class: clsx(classes?.nav) })))}>`);
				navButton($$renderer, false);
				$$renderer.push(`<!----> `);

				Button($$renderer, {
					type: 'button',
					class: polite({
						class: clsx("cursor-pointer rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700", classes?.polite)
					}),
					'aria-live': 'polite',
					onclick: (event) => toggleMonthSelector(event),
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(currentMonth.toLocaleString(finalTranslationLocale(), { month: "long", year: "numeric" }))}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				navButton($$renderer, true);
				$$renderer.push(`<!----></div> <div${$.attr_class($.clsx(grid({ class: clsx(theme()?.grid, classes?.grid) })))} role="grid"><!--[-->`);

				const each_array_1 = $.ensure_array_like(weekdays());

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let day = each_array_1[$$index_1];

					$$renderer.push(`<div${$.attr_class($.clsx(columnHeader({ class: clsx(theme()?.columnHeader, classes?.columnHeader) })))} role="columnheader">${$.escape(day)}</div>`);
				}

				$$renderer.push(`<!--]--> <!--[-->`);

				const each_array_2 = $.ensure_array_like(daysInMonth());

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let day = each_array_2[$$index_2];
					const current = day.getMonth() !== currentMonth.getMonth();
					const available = isDateAvailable(day);

					Button($$renderer, {
						type: 'button',
						color: isSelected()(day) ? color : "alternative",
						class: dayButton({
							current,
							today: isToday(day),
							color: isInRange(day) ? color : undefined,
							unavailable: !available,
							class: clsx(theme()?.dayButton, classes?.dayButton, !available && "cursor-not-allowed opacity-50")
						}),
						onclick: () => handleDaySelect(day),
						onkeydown: handleCalendarKeydown,
						'aria-label': day.toLocaleDateString(finalTranslationLocale(), {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric"
						}),
						'aria-selected': isSelected()(day),
						'aria-disabled': !available,
						disabled: !available,
						role: 'gridcell',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(day.getDate())}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (showActionButtons && !showMonthSelector) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(actionButtons({ class: clsx(theme()?.actionButtons, classes?.actionButtons) })))}>`);

				Button($$renderer, {
					onclick: () => handleDaySelect(new Date()),
					color,
					size: 'sm',
					disabled: !isDateAvailable(new Date()),
					children: ($$renderer) => {
						$$renderer.push(`<!---->Today`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					onclick: handleClear,
					color: 'red',
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Clear`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					onclick: handleApply,
					color,
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Apply`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (actionSlot) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(clsx(classes?.actionSlot, theme()?.actionSlot)))}>`);

				actionSlot($$renderer, {
					selectedDate: range ? { from: rangeFrom, to: rangeTo } : value,
					handleClear,
					handleApply,
					close: () => {
						isOpen = false;
						showMonthSelector = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value, rangeFrom, rangeTo, elementRef });
	});
}