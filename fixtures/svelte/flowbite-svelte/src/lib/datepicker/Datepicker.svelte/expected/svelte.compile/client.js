import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_svg(`<svg class="h-3 w-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`);
var root_1 = $.from_html(`<div class="relative"><input/> <button type="button"><svg class="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"></path></svg></button></div>`);
var root_2 = $.from_html(`<h2> </h2>`);
var root_3 = $.from_html(`<div><!> <h3 aria-live="polite"> </h3> <!></div> <div class="grid grid-cols-4 gap-2 p-4"></div>`, 1);
var root_4 = $.from_html(`<div role="columnheader"> </div>`);
var root_5 = $.from_html(`<div><!> <!> <!></div> <div role="grid"><!> <!></div>`, 1);
var root_6 = $.from_html(`<div><!> <!> <!></div>`);
var root_7 = $.from_html(`<div><!></div>`);
var root_8 = $.from_html(`<div id="datepicker-dropdown" role="dialog" aria-label="Calendar"><!> <!> <!> <!></div>`);
var root_9 = $.from_html(`<div><!> <!></div>`);

export default function Datepicker($$anchor, $$props) {
	$.push($$props, true);

	const // If translationLocale is not explicitly provided, it will default to the value of locale. This ensures reactivity as both are directly exposed as props.
	// Continue to next strategy
	// German: 17.7.2025
	// German: 17.07.2025
	// US: 7/17/2025
	// US: 07/17/2025
	// UK: 17/7/2025
	// UK: 17/07/2025
	// ISO: 2025-07-17
	// ISO: 2025-7-17
	// US with dashes: 7-17-2025
	// EU with dashes: 17-7-2025
	// Continue to next format
	// Continue
	// January 15, 2025
	// German/European format with dots
	// Default to day first
	// US/UK format with slashes
	// US format
	// UK format
	// December 3, 2025
	// ISO or other dash format
	// Default fallback - try to detect based on locale
	// Use locale for formatting (not finalTranslationLocale)
	// Use finalTranslationLocale for aria-label
	navButton = ($$anchor, forward = $.noop) => {
		{
			let $0 = $.derived(() => forward() ? "Next month" : "Previous month");

			ToolbarButton($$anchor, {
				color: 'dark',
				onclick: () => changeMonth(forward() ? 1 : -1),
				size: 'lg',
				get 'aria-label'() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var svg = root();
					var path = $.only_child(svg);

					$.template_effect(() => $.set_attribute(path, 'd', forward() ? "M1 5h12m0 0L9 1m4 4L9 9" : "M13 5H1m0 0 4 4M1 5l4-4"));
					$.append($$anchor, svg);
				},
				$$slots: { default: true }
			});
		}
	};

	const yearNavButton = ($$anchor, forward = $.noop) => {
		{
			let $0 = $.derived(() => forward() ? "Next year" : "Previous year");

			ToolbarButton($$anchor, {
				color: 'dark',
				onclick: () => changeYear(forward() ? 1 : -1),
				size: 'lg',
				get 'aria-label'() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var svg_1 = root();
					var path_1 = $.only_child(svg_1);

					$.template_effect(() => $.set_attribute(path_1, 'd', forward() ? "M1 5h12m0 0L9 1m4 4L9 9" : "M13 5H1m0 0 4 4M1 5l4-4"));
					$.append($$anchor, svg_1);
				},
				$$slots: { default: true }
			});
		}
	};

	let value = $.prop($$props, 'value', 15),
		defaultDate = $.prop($$props, 'defaultDate', 3, null),
		range = $.prop($$props, 'range', 3, false),
		rangeFrom = $.prop($$props, 'rangeFrom', 15),
		rangeTo = $.prop($$props, 'rangeTo', 15),
		availableFrom = $.prop($$props, 'availableFrom', 3, null),
		availableTo = $.prop($$props, 'availableTo', 3, null),
		locale = $.prop($$props, 'locale', 3, "default"),
		firstDayOfWeek = $.prop($$props, 'firstDayOfWeek', 3, 0),
		placeholder = $.prop($$props, 'placeholder', 3, "Select date"),
		disabled = $.prop($$props, 'disabled', 3, false),
		required = $.prop($$props, 'required', 3, false),
		inputClass = $.prop($$props, 'inputClass', 3, ""),
		color = $.prop($$props, 'color', 3, "primary"),
		inline = $.prop($$props, 'inline', 3, false),
		autohide = $.prop($$props, 'autohide', 3, true),
		showActionButtons = $.prop($$props, 'showActionButtons', 3, false),
		title = $.prop($$props, 'title', 3, ""),
		inputmode = $.prop($$props, 'inputmode', 3, "none"),
		monthColor = $.prop($$props, 'monthColor', 3, "alternative"),
		monthBtnSelected = $.prop($$props, 'monthBtnSelected', 3, "bg-primary-500 text-white"),
		monthBtn = $.prop($$props, 'monthBtn', 3, "text-gray-700 dark:text-gray-300"),
		elementRef = $.prop($$props, 'elementRef', 15),
		inputProps = $.prop($$props, 'inputProps', 19, () => ({}));

	const theme = $.derived(() => getTheme("datepicker"));
	const finalTranslationLocale = $.derived(() => $$props.translationLocale ?? locale());
	let isOpen = $.state(false);

	$.user_effect(() => {
		$.set(isOpen, inline());
	});

	let showMonthSelector = $.state(false);
	let datepickerContainerElement;
	let currentMonth = $.state($.proxy(new Date()));

	$.user_effect(() => {
		$.set(currentMonth, value() || defaultDate() || new Date(), true);
	});

	let focusedDate = null;
	let calendarRef = $.state(null);
	let daysInMonth = $.derived(() => getDaysInMonth($.get(currentMonth)));

	onMount(() => {
		if (!inline()) {
			datepickerContainerElement?.ownerDocument.addEventListener("click", handleClickOutside);

			return () => {
				datepickerContainerElement?.ownerDocument.removeEventListener("click", handleClickOutside);
			};
		}
	});

	function getDaysInMonth(date) {
		const monthStart = startOfMonth(date);
		const monthEnd = endOfMonth(date);
		const calendarStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek() });
		const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek() });

		return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
	}

	const getWeekdayNames = () => {
		const referenceDate = new Date(1970, 0, 4 + firstDayOfWeek());

		return Array.from({ length: 7 }, (_, i) => addDays(referenceDate, i).toLocaleDateString($.get(finalTranslationLocale), { weekday: "short" }));
	};

	let weekdays = $.derived(getWeekdayNames);

	const getMonthNames = () => {
		return Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString($.get(finalTranslationLocale), { month: "short" }));
	};

	let monthNames = $.derived(getMonthNames);
	const addDay = (date, increment) => addDays(date, increment);

	function changeMonth(increment) {
		$.set(currentMonth, new Date($.get(currentMonth).getFullYear(), $.get(currentMonth).getMonth() + increment, 1), true);
	}

	function changeYear(increment) {
		$.set(currentMonth, new Date($.get(currentMonth).getFullYear() + increment, $.get(currentMonth).getMonth(), 1), true);
	}

	function selectMonth(monthIndex, event) {
		event.stopPropagation();
		$.set(currentMonth, new Date($.get(currentMonth).getFullYear(), monthIndex, 1), true);
		$.set(showMonthSelector, false);
	}

	function toggleMonthSelector(event) {
		event.stopPropagation();
		$.set(showMonthSelector, !$.get(showMonthSelector));
	}

	function isDateAvailable(date) {
		const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

		if (availableFrom()) {
			const fromDate = new Date(availableFrom().getFullYear(), availableFrom().getMonth(), availableFrom().getDate());

			if (dateOnly < fromDate) return false;
		}

		if (availableTo()) {
			const toDate = new Date(availableTo().getFullYear(), availableTo().getMonth(), availableTo().getDate());

			if (dateOnly > toDate) return false;
		}

		return true;
	}

	function handleDaySelect(day) {
		if (!isDateAvailable(day)) return;

		if (range()) {
			if (!rangeFrom() || rangeFrom() && rangeTo()) {
				rangeFrom(day);
				rangeTo(undefined);
			} else if (day < rangeFrom()) {
				const oldRangeFrom = rangeFrom();

				rangeFrom(day);
				rangeTo(oldRangeFrom);
			} else {
				rangeTo(day);
			}

			$$props.onselect?.({ from: rangeFrom(), to: rangeTo() });
		} else {
			value(day);
			$$props.onselect?.(value());

			if (autohide() && !inline()) $.set(isOpen, false);
		}
	}

	function handleInputChangeWithDateFns() {
		const inputValue = elementRef()?.value?.trim();

		if (!inputValue) {
			rangeFrom(undefined);
			rangeTo(undefined);
			elementRef()?.setCustomValidity("");

			return;
		}

		elementRef()?.setCustomValidity("");

		if (range()) {
			const parts = inputValue.split(" - ");

			if (parts.length === 2) {
				const parsedFrom = tryParseDate(parts[0]);
				const parsedTo = tryParseDate(parts[1]);

				if (parsedFrom && isValid(parsedFrom) && isDateAvailable(parsedFrom) && parsedTo && isValid(parsedTo) && isDateAvailable(parsedTo)) {
					(($$value) => {
						var $$array = $.to_array($$value, 2);

						rangeFrom($$array[0]);
						rangeTo($$array[1]);
					})(parsedFrom > parsedTo ? [parsedTo, parsedFrom] : [parsedFrom, parsedTo]);

					$$props.onselect?.({ from: rangeFrom(), to: rangeTo() });

					return;
				} else {
					elementRef()?.setCustomValidity(`Please enter date range in format: ${getDateFormatPattern()} - ${getDateFormatPattern()}`);

					return;
				}
			}
		}

		const parsedDate = tryParseDate(inputValue);

		if (!parsedDate || !isValid(parsedDate)) {
			const formatPattern = getDateFormatPattern();

			elementRef()?.setCustomValidity(`Please enter date in format: ${formatPattern}`);

			return;
		}

		if (!isDateAvailable(parsedDate)) {
			elementRef()?.setCustomValidity("Selected date is not available");

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
		const actualLocale = locale() === "default" ? navigator.language : locale();
		const testDate = new Date(2025, 0, 15); // January 15, 2025
		const formatted = testDate.toLocaleDateString(actualLocale, $$props.dateFormat || { year: "numeric", month: "numeric", day: "numeric" });

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
			const formatted2 = testDate2.toLocaleDateString(actualLocale, $$props.dateFormat || { year: "numeric", month: "numeric", day: "numeric" });

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
		if ($.get(isOpen) && datepickerContainerElement && !datepickerContainerElement.contains(event.target)) {
			$.set(isOpen, false);
			$.set(showMonthSelector, false);
		}
	}

	// Use locale for formatting (not finalTranslationLocale)
	const formatDate = (date) => date?.toLocaleDateString(locale(), $$props.dateFormat) ?? "";

	const isSameDate = (date1, date2) => date1 && date2 ? isSameDay(date1, date2) : false;
	const isToday = (day) => isSameDate(day, new Date());
	const isInRange = (day) => !!(range() && rangeFrom() && rangeTo() && isWithinInterval(day, { start: rangeFrom(), end: rangeTo() }));

	let isSelected = $.derived(() => (day) => range()
		? isSameDate(day, rangeFrom()) || isSameDate(day, rangeTo())
		: isSameDate(day, value()));

	function handleCalendarKeydown(event) {
		if (!$.get(isOpen)) return;

		if (!focusedDate) {
			focusedDate = value() || new Date();
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
				if (range()) {
					if (rangeFrom() && rangeTo()) {
						if (autohide() && !inline()) $.set(isOpen, false);
					} else {
						handleDaySelect(focusedDate);
					}
				} else {
					handleDaySelect(focusedDate);

					if (autohide() && !inline()) $.set(isOpen, false);
				}
				break;

			case "Escape":
				$.set(isOpen, false);
				$.set(showMonthSelector, false);
				elementRef()?.focus();
				break;

			default:
				return;
		}

		event.preventDefault();

		if (focusedDate.getMonth() !== $.get(currentMonth).getMonth()) {
			$.set(currentMonth, new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1), true);
		}

		// Use finalTranslationLocale for aria-label
		setTimeout(
			() => {
				const focusedButton = $.get(calendarRef)?.querySelector(`button[aria-label="${focusedDate.toLocaleDateString($.get(finalTranslationLocale), {
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

			if (autohide() && !inline()) {
				$.set(isOpen, false);
			}
		} else if (event.key === " ") {
			event.preventDefault();
			$.set(isOpen, !$.get(isOpen));
		}
	}

	function handleClear() {
		value(rangeFrom(rangeTo(undefined)));
		$$props.onclear?.();
	}

	function handleApply() {
		const result = range() ? { from: rangeFrom(), to: rangeTo() } : value();

		if (result) $$props.onapply?.(result);
		if (!inline()) $.set(isOpen, false);
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

	var div = root_9();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var input_1 = $.child(div_1);
			var event_handler = () => $.set(isOpen, true);

			$.attribute_effect(
				input_1,
				($0, $1) => ({
					...inputProps(),
					type: 'text',
					class: $0,
					placeholder: placeholder(),
					value: $1,
					onfocus: event_handler,
					onchange: handleInputChangeWithDateFns,
					onkeydown: handleInputKeydown,
					disabled: disabled(),
					required: required(),
					inputmode: inputmode(),
					'aria-haspopup': 'dialog'
				}),
				[
					() => input({
						color: color(),
						class: clsx($.get(theme)?.input, inputClass())
					}),

					() => range()
						? `${formatDate(rangeFrom())} - ${formatDate(rangeTo())}`
						: formatDate(value())
				],
				void 0,
				void 0,
				void 0,
				true
			);

			$.bind_this(input_1, ($$value) => elementRef($$value), () => elementRef());

			var button_1 = $.sibling(input_1, 2);

			$.reset(div_1);

			$.template_effect(
				($0) => {
					$.set_class(button_1, 1, $0);
					button_1.disabled = disabled();
					$.set_attribute(button_1, 'aria-label', $.get(isOpen) ? "Close date picker" : "Open date picker");
				},
				[
					() => $.clsx(button({
						class: clsx($$props.btnClass, $.get(theme)?.button, $$props.classes?.button)
					}))
				]
			);

			$.delegated('click', button_1, () => $.set(isOpen, !$.get(isOpen)));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!inline()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_2 = root_8();
			var node_2 = $.child(div_2);

			{
				var consequent_1 = ($$anchor) => {
					var h2 = root_2();
					var text = $.only_child(h2, true);

					$.template_effect(
						($0) => {
							$.set_class(h2, 1, $0);
							$.set_text(text, title());
						},
						[
							() => $.clsx(titleVariant({
								class: clsx($.get(theme)?.titleVariant, $$props.classes?.titleVariant)
							}))
						]
					);

					$.append($$anchor, h2);
				};

				$.if(node_2, ($$render) => {
					if (title()) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = root_3();
					var div_3 = $.first_child(fragment_2);
					var node_4 = $.child(div_3);

					yearNavButton(node_4, () => false);

					var h3 = $.sibling(node_4, 2);
					var text_1 = $.only_child(h3, true);
					var node_5 = $.sibling(h3, 2);

					yearNavButton(node_5, () => true);
					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);

					$.each(div_4, 21, () => $.get(monthNames), $.index, ($$anchor, month, index) => {
						{
							let $0 = $.derived(() => monthButton({
								class: clsx($.get(currentMonth).getMonth() === index ? monthBtnSelected() : monthBtn(), $$props.classes?.monthButton, $.get(theme)?.monthButton)
							}));

							Button($$anchor, {
								type: 'button',
								get color() {
									return monthColor();
								},

								get class() {
									return $.get($0);
								},
								onclick: (event) => selectMonth(index, event),
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text();

									$.template_effect(() => $.set_text(text_2, $.get(month)));
									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						}
					});

					$.reset(div_4);

					$.template_effect(
						($0, $1, $2) => {
							$.set_class(div_3, 1, $0);
							$.set_class(h3, 1, $1);
							$.set_text(text_1, $2);
						},
						[
							() => $.clsx(nav({ class: clsx($.get(theme)?.nav, $$props.classes?.nav) })),
							() => $.clsx(polite({ class: clsx($.get(theme)?.polite, $$props.classes?.polite) })),
							() => $.get(currentMonth).getFullYear()
						]
					);

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_5 = root_5();
					var div_5 = $.first_child(fragment_5);
					var node_6 = $.child(div_5);

					navButton(node_6, () => false);

					var node_7 = $.sibling(node_6, 2);

					{
						let $0 = $.derived(() => polite({
							class: clsx("cursor-pointer rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700", $$props.classes?.polite)
						}));

						Button(node_7, {
							type: 'button',
							get class() {
								return $.get($0);
							},
							'aria-live': 'polite',
							onclick: (event) => toggleMonthSelector(event),
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text();

								$.template_effect(($0) => $.set_text(text_3, $0), [
									() => $.get(currentMonth).toLocaleString($.get(finalTranslationLocale), { month: "long", year: "numeric" })
								]);

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					}

					var node_8 = $.sibling(node_7, 2);

					navButton(node_8, () => true);
					$.reset(div_5);

					var div_6 = $.sibling(div_5, 2);
					var node_9 = $.child(div_6);

					$.each(node_9, 16, () => $.get(weekdays), (day) => day, ($$anchor, day) => {
						var div_7 = root_4();
						var text_4 = $.only_child(div_7, true);

						$.template_effect(
							($0) => {
								$.set_class(div_7, 1, $0);
								$.set_text(text_4, day);
							},
							[
								() => $.clsx(columnHeader({
									class: clsx($.get(theme)?.columnHeader, $$props.classes?.columnHeader)
								}))
							]
						);

						$.append($$anchor, div_7);
					});

					var node_10 = $.sibling(node_9, 2);

					$.each(node_10, 16, () => $.get(daysInMonth), (day) => day, ($$anchor, day) => {
						const current = $.derived(() => day.getMonth() !== $.get(currentMonth).getMonth());
						const available = $.derived(() => isDateAvailable(day));

						{
							let $0 = $.derived(() => $.get(isSelected)(day) ? color() : "alternative");

							let $1 = $.derived(() => dayButton({
								current: $.get(current),
								today: isToday(day),
								color: isInRange(day) ? color() : undefined,
								unavailable: !$.get(available),
								class: clsx($.get(theme)?.dayButton, $$props.classes?.dayButton, !$.get(available) && "cursor-not-allowed opacity-50")
							}));

							let $2 = $.derived(() => day.toLocaleDateString($.get(finalTranslationLocale), {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric"
							}));

							let $3 = $.derived(() => $.get(isSelected)(day));
							let $4 = $.derived(() => !$.get(available));
							let $5 = $.derived(() => !$.get(available));

							Button($$anchor, {
								type: 'button',
								get color() {
									return $.get($0);
								},

								get class() {
									return $.get($1);
								},
								onclick: () => handleDaySelect(day),
								onkeydown: handleCalendarKeydown,
								get 'aria-label'() {
									return $.get($2);
								},

								get 'aria-selected'() {
									return $.get($3);
								},

								get 'aria-disabled'() {
									return $.get($4);
								},

								get disabled() {
									return $.get($5);
								},
								role: 'gridcell',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text();

									$.template_effect(($0) => $.set_text(text_5, $0), [() => day.getDate()]);
									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						}
					});

					$.reset(div_6);

					$.template_effect(
						($0, $1) => {
							$.set_class(div_5, 1, $0);
							$.set_class(div_6, 1, $1);
						},
						[
							() => $.clsx(nav({ class: clsx($$props.classes?.nav) })),
							() => $.clsx(grid({ class: clsx($.get(theme)?.grid, $$props.classes?.grid) }))
						]
					);

					$.append($$anchor, fragment_5);
				};

				$.if(node_3, ($$render) => {
					if ($.get(showMonthSelector)) $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			var node_11 = $.sibling(node_3, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_8 = root_6();
					var node_12 = $.child(div_8);

					{
						let $0 = $.derived(() => !isDateAvailable(new Date()));

						Button(node_12, {
							onclick: () => handleDaySelect(new Date()),
							get color() {
								return color();
							},
							size: 'sm',
							get disabled() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Today');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});
					}

					var node_13 = $.sibling(node_12, 2);

					Button(node_13, {
						onclick: handleClear,
						color: 'red',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Clear');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					Button(node_14, {
						onclick: handleApply,
						get color() {
							return color();
						},
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Apply');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.reset(div_8);

					$.template_effect(($0) => $.set_class(div_8, 1, $0), [
						() => $.clsx(actionButtons({
							class: clsx($.get(theme)?.actionButtons, $$props.classes?.actionButtons)
						}))
					]);

					$.append($$anchor, div_8);
				};

				$.if(node_11, ($$render) => {
					if (showActionButtons() && !$.get(showMonthSelector)) $$render(consequent_3);
				});
			}

			var node_15 = $.sibling(node_11, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_9 = root_7();
					var node_16 = $.child(div_9);

					$.snippet(node_16, () => $$props.actionSlot, () => ({
						selectedDate: range() ? { from: rangeFrom(), to: rangeTo() } : value(),
						handleClear,
						handleApply,
						close: () => {
							$.set(isOpen, false);
							$.set(showMonthSelector, false);
						}
					}));

					$.reset(div_9);

					$.template_effect(($0) => $.set_class(div_9, 1, $0), [
						() => $.clsx(clsx($$props.classes?.actionSlot, $.get(theme)?.actionSlot))
					]);

					$.append($$anchor, div_9);
				};

				$.if(node_15, ($$render) => {
					if ($$props.actionSlot) $$render(consequent_4);
				});
			}

			$.reset(div_2);
			$.bind_this(div_2, ($$value) => $.set(calendarRef, $$value), () => $.get(calendarRef));

			$.template_effect(($0) => $.set_class(div_2, 1, $0), [
				() => $.clsx(base({
					inline: inline(),
					class: clsx($.get(theme)?.base, $$props.class)
				}))
			]);

			$.transition(3, div_2, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isOpen) || inline()) $$render(consequent_5);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => datepickerContainerElement = $$value, () => datepickerContainerElement);
	$.template_effect(() => $.set_class(div, 1, $.clsx(["relative", inline() && "inline-block"])));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);