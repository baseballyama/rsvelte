import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutside, componentPosition } from "$lib/utils/event.js";
import { cubicOut } from "svelte/easing";
import Calendar from "$lib/icons/calendar.svelte";
import { ChevronLeft } from "$lib/icons/index.js";
import { ChevronRight } from "$lib/icons/index.js";
import { Button } from "$lib/index.js";

import {
	formatDateRange,
	generateCalendar,
	getFirstAndLastDay,
	getMonthDateRange,
	getZeroDate,
	isZeroDate,
	nextMonth,
	prevMonth,
	selectedValue
} from "$lib/utils/calendar.js";

import { fade, fly } from "svelte/transition";
import Weekday from "./weekday.svelte";

var root = $.from_html(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm font-normal capitalize"> </h2>`);
var root_1 = $.from_html(`<div class="relative flex items-center justify-center"><div class="relative z-[0.01] h-10 w-10 lg:h-8.5 lg:w-8.5"><div class="flex h-full w-full justify-center"><button class="relative flex h-full w-full items-center justify-center rounded-xs"><span class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-xs font-normal tracking-[0.06px]"> </span></button></div></div></div>`);
var root_2 = $.from_html(`<div class="relative flex items-center justify-center"><!></div>`);

var root_3 = $.from_html(
	`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-b-kui-light-gray-200 dark:border-b-kui-dark-gray-200 border-t-kui-light-gray-600 dark:border-t-kui-dark-gray-500
		lg:border-kui-light-gray-200 lg:dark:border-kui-dark-gray-200 overflow-y-auto scroll-smooth rounded-t-[10px]
		border-t border-b p-6 lg:rounded-md
		lg:border lg:p-3 lg:shadow-xs"><div class="grid grid-cols-7 items-center gap-y-1.25"><div><div class="flex w-full items-center justify-center"><button class="text-kui-light-gray-700 dark:text-kui-dark-gray-700 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000 flex h-10 w-10 items-center justify-center transition-colors lg:h-8.5 lg:w-8.5"><span class="h-4 w-4"><!></span></button></div></div> <div class="col-span-5"><div class="text-center"><!></div></div> <div><div class="flex w-full items-center justify-center"><button class="text-kui-light-gray-700 dark:text-kui-dark-gray-700 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000 flex h-10 w-10 items-center justify-center transition-colors lg:h-8.5 lg:w-8.5"><span class="h-4 w-4"><!></span></button></div></div></div> <div class="mt-3 grid grid-cols-7 gap-y-3 lg:gap-y-2"><!> <!></div></div> <footer class="p-4 lg:hidden"><!></footer>`,
	1
);

var root_4 = $.from_html(`<div class="bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary fixed bottom-0 left-0 z-1001 w-full rounded-t-[10px] lg:bg-transparent"><!></div>`);
var root_5 = $.from_html(`<div><!></div>`);
var root_6 = $.from_html(`<div class="fixed top-0 left-0 z-1000 h-full w-full bg-black opacity-35 lg:hidden dark:opacity-45"></div>`);
var root_7 = $.from_html(`<!> <div class="relative inline-block"><button class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 border-kui-light-gray-400 dark:border-kui-dark-gray-400 hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100 box-border flex h-10 w-62.5 items-center rounded-md border px-2.5 text-sm font-normal capitalize transition-colors"><span class="flex h-5 w-5 items-center justify-center"><span class="h-4 w-4"><!></span></span> <span class="px-1.5"> </span></button> <!></div>`, 1);

export default function Calendar_1($$anchor, $$props) {
	$.push($$props, true);

	const // Selection
	// Reset to trigger re-render on month change. Needed for transition to work
	// update when the user is resizing the window
	calendarSnip = ($$anchor) => {
		var fragment = root_3();
		var div = $.first_child(fragment);
		var div_1 = $.child(div);
		var div_2 = $.child(div_1);
		var div_3 = $.child(div_2);
		var button = $.child(div_3);
		var span = $.child(button);
		var node = $.child(span);

		ChevronLeft(node, {});
		$.reset(span);
		$.reset(button);
		$.reset(div_3);
		$.reset(div_2);

		var div_4 = $.sibling(div_2, 2);
		var div_5 = $.child(div_4);
		var node_1 = $.child(div_5);

		{
			var consequent = ($$anchor) => {
				var h2 = root();
				var text = $.only_child(h2, true);

				$.template_effect(() => $.set_text(text, $.get(monthAndYear)));
				$.append($$anchor, h2);
			};

			$.if(node_1, ($$render) => {
				if ($.get(monthAndYear)) $$render(consequent);
			});
		}

		$.reset(div_5);
		$.reset(div_4);

		var div_6 = $.sibling(div_4, 2);
		var div_7 = $.child(div_6);
		var button_1 = $.child(div_7);
		var span_1 = $.child(button_1);
		var node_2 = $.child(span_1);

		ChevronRight(node_2, {});
		$.reset(span_1);
		$.reset(button_1);
		$.reset(div_7);
		$.reset(div_6);
		$.reset(div_1);

		var div_8 = $.sibling(div_1, 2);
		var node_3 = $.child(div_8);

		$.each(node_3, 17, () => days, $.index, ($$anchor, day) => {
			var div_9 = root_1();
			var div_10 = $.child(div_9);
			var div_11 = $.child(div_10);
			var button_2 = $.child(div_11);
			var span_2 = $.child(button_2);
			var text_1 = $.only_child(span_2, true);

			$.reset(button_2);
			$.reset(div_11);
			$.reset(div_10);
			$.reset(div_9);
			$.template_effect(() => $.set_text(text_1, $.get(day).short));
			$.append($$anchor, div_9);
		});

		var node_4 = $.sibling(node_3, 2);

		$.each(node_4, 17, () => $.get(calendarList), $.index, ($$anchor, row) => {
			var div_12 = root_2();
			var node_5 = $.child(div_12);

			Weekday(node_5, {
				get dayAndDateObj() {
					return $.get(row);
				},

				get startDate() {
					return $.get(startDate);
				},

				set startDate($$value) {
					$.set(startDate, $$value, true);
				},

				get endDate() {
					return $.get(endDate);
				},

				set endDate($$value) {
					$.set(endDate, $$value, true);
				}
			});

			$.reset(div_12);
			$.append($$anchor, div_12);
		});

		$.reset(div_8);
		$.reset(div);

		var footer = $.sibling(div, 2);
		var node_6 = $.child(footer);

		Button(node_6, {
			onclick: () => {
				$.set(isActive, false);
			},
			variant: 'secondary',
			class: 'w-full',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('done');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});

		$.reset(footer);

		$.delegated('click', button, () => {
			reset();
			$.set(currentMonth, prevMonth($.get(currentMonth)), true);
		});

		$.delegated('click', button_1, () => {
			reset();
			$.set(currentMonth, nextMonth($.get(currentMonth)), true);
		});

		$.append($$anchor, fragment);
	};

	const mobileSnip = ($$anchor) => {
		var fragment_1 = $.comment();
		var node_7 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				var div_13 = root_4();
				var node_8 = $.child(div_13);

				calendarSnip(node_8);
				$.reset(div_13);
				$.transition(1, div_13, () => fly, () => ({ y: "50vh", duration: 500, opacity: 1 }));
				$.transition(2, div_13, () => fly, () => ({ y: "100vh", duration: 600, easing: cubicOut, opacity: 1 }));
				$.append($$anchor, div_13);
			};

			$.if(node_7, ($$render) => {
				if ($.get(isActive)) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	};

	const desktopSnip = ($$anchor) => {
		var fragment_2 = $.comment();
		var node_9 = $.first_child(fragment_2);

		{
			var consequent_2 = ($$anchor) => {
				var div_14 = root_5();
				var node_10 = $.child(div_14);

				calendarSnip(node_10);
				$.reset(div_14);
				$.template_effect(() => $.set_class(div_14, 1, `absolute ${$.get(desktopPosition) == 'top' ? 'top-[112%]' : 'bottom-[112%]'} z-1001`));
				$.transition(1, div_14, () => fly, () => ({ y: -10 }));
				$.transition(2, div_14, () => fly, () => ({ y: -10 }));
				$.append($$anchor, div_14);
			};

			$.if(node_9, ($$render) => {
				if ($.get(isActive)) $$render(consequent_2);
			});
		}

		$.append($$anchor, fragment_2);
	};

	let value = $.prop($$props, 'value', 15);

	const days = [
		{ short: "Su", long: "Sunday" },
		{ short: "Mo", long: "Monday" },
		{ short: "Tu", long: "Tuesday" },
		{ short: "We", long: "Wednesday" },
		{ short: "Th", long: "Thursday" },
		{ short: "Fr", long: "Friday" },
		{ short: "Sa", long: "Saturday" }
	];

	let isActive = $.state(false);
	let isMobile = $.state(false);
	let desktopPosition = $.state("top");
	let currentMonth = $.state($.proxy(new Date()));
	let calendarList = $.state($.proxy([]));
	let monthAndYear = $.state("");
	let strValue = $.state("select date range");
	let startDate = $.state($.proxy(getZeroDate()));
	let endDate = $.state($.proxy(getZeroDate()));

	const reset = () => {
		$.set(calendarList, [], true);
		$.set(monthAndYear, "");
	};

	$.user_effect(() => {
		const [, monthEnd] = getFirstAndLastDay($.get(currentMonth));
		const list = getMonthDateRange($.get(currentMonth), monthEnd);

		$.set(calendarList, generateCalendar(list), true);

		$.set(monthAndYear, `${$.get(currentMonth).toLocaleString("default", { month: "long" })}
						${$.get(currentMonth).getFullYear()}`);
	});

	$.user_effect(() => {
		if (!isZeroDate($.get(startDate)) && !isZeroDate($.get(endDate))) {
			$.set(strValue, formatDateRange($.get(startDate), $.get(endDate)), true);
			value(selectedValue($.get(startDate), $.get(endDate)));
		}
	});

	$.user_effect(() => {
		if (window.innerWidth < 767) {
			$.set(isMobile, true);
		} else {
			$.set(isMobile, false);
		}

		// update when the user is resizing the window
		window.addEventListener("resize", () => {
			if (window.innerWidth < 767) {
				$.set(isMobile, true);
			} else {
				$.set(isMobile, false);
			}
		});
	});

	const toggle = (evt) => {
		$.set(desktopPosition, componentPosition(evt), true);
		$.set(isActive, !$.get(isActive));
	};

	var fragment_3 = root_7();
	var node_11 = $.first_child(fragment_3);

	{
		var consequent_3 = ($$anchor) => {
			var div_15 = root_6();

			$.transition(1, div_15, () => fade);
			$.transition(2, div_15, () => fade);
			$.append($$anchor, div_15);
		};

		$.if(node_11, ($$render) => {
			if ($.get(isActive)) $$render(consequent_3);
		});
	}

	var div_16 = $.sibling(node_11, 2);
	var button_3 = $.child(div_16);
	var span_3 = $.child(button_3);
	var span_4 = $.child(span_3);
	var node_12 = $.child(span_4);

	Calendar(node_12, {});
	$.reset(span_4);
	$.reset(span_3);

	var span_5 = $.sibling(span_3, 2);
	var text_3 = $.only_child(span_5, true);

	$.reset(button_3);

	var node_13 = $.sibling(button_3, 2);

	{
		var consequent_4 = ($$anchor) => {
			mobileSnip($$anchor);
		};

		var alternate = ($$anchor) => {
			desktopSnip($$anchor);
		};

		$.if(node_13, ($$render) => {
			if ($.get(isMobile)) $$render(consequent_4); else $$render(alternate, -1);
		});
	}

	$.reset(div_16);

	$.action(div_16, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => {
		$.set(isActive, false);
	});

	$.template_effect(() => $.set_text(text_3, $.get(strValue)));
	$.delegated('click', button_3, toggle);
	$.append($$anchor, fragment_3);
	$.pop();
}

$.delegate(['click']);