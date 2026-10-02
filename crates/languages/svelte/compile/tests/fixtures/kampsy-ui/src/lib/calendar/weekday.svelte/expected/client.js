import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	getZeroDate,
	isInDateRange,
	isStartDateGreaterThanEndDate,
	isWeekend,
	isZeroDate
} from "$lib/utils/calendar.js";

var root = $.from_html(`<div></div> <div><div class="flex h-full w-full justify-center"><button class="flex h-full w-full items-center justify-center rounded-xs"><span> </span></button></div></div>`, 1);

export default function Weekday($$anchor, $$props) {
	$.push($$props, true);

	let startDate = $.prop($$props, 'startDate', 31, () => $.proxy(getZeroDate())),
		endDate = $.prop($$props, 'endDate', 31, () => $.proxy(getZeroDate()));

	const isToday = (date) => {
		const today = new Date();

		return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
	};

	const isHighlighteble = (date) => {
		if (!isZeroDate(date)) {
			if (!isZeroDate(startDate()) || !isZeroDate(endDate())) {
				if (date.getDate() === startDate().getDate() && date.getMonth() === startDate().getMonth() && date.getFullYear() === startDate().getFullYear() || date.getDate() === endDate().getDate() && date.getMonth() === endDate().getMonth() && date.getFullYear() === endDate().getFullYear()) {
					return true;
				}
			}
		}

		return false;
	};

	const isRangeHighlighteble = () => {
		if (!isZeroDate($$props.dayAndDateObj.dateObj) && !isZeroDate(startDate()) && !isZeroDate(endDate())) {
			if (isInDateRange($$props.dayAndDateObj.dateObj, startDate(), endDate())) {
				return true;
			}
		}

		return false;
	};

	const dayBg = $.derived(() => {
		if (isHighlighteble($$props.dayAndDateObj.dateObj)) {
			return `rounded-sm bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000`;
		}

		if (isToday($$props.dayAndDateObj.dateObj)) {
			return `rounded-sm bg-kui-light-blue-900 dark:bg-kui-dark-blue-900`;
		}

		return "";
	});

	const dayText = $.derived(() => {
		if (isHighlighteble($$props.dayAndDateObj.dateObj)) {
			return `text-kui-light-bg dark:text-kui-dark-bg`;
		}

		if (isToday($$props.dayAndDateObj.dateObj)) {
			return `text-kui-light-bg dark:text-kui-dark-bg`;
		}

		if (isRangeHighlighteble() && !isWeekend($$props.dayAndDateObj.dateObj)) {
			return "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000";
		}

		if (isWeekend($$props.dayAndDateObj.dateObj)) {
			return "text-kui-light-gray-900 dark:text-kui-dark-gray-900";
		}

		return "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000";
	});

	const rangeBg = $.derived(() => {
		if (isRangeHighlighteble()) {
			return "bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100";
		}

		return "";
	});

	const onclick = () => {
		if (isZeroDate(startDate()) && isZeroDate(endDate())) {
			if (!isZeroDate($$props.dayAndDateObj.dateObj)) {
				startDate($$props.dayAndDateObj.dateObj);
			}
		} else if (!isZeroDate(startDate()) && isZeroDate(endDate())) {
			if (!isZeroDate($$props.dayAndDateObj.dateObj)) {
				// an edge ace. if the date selected as end date is less than
				// the start date, swap the two dates
				if (isStartDateGreaterThanEndDate(startDate(), $$props.dayAndDateObj.dateObj)) {
					endDate(startDate());
					startDate($$props.dayAndDateObj.dateObj);
				} else {
					endDate($$props.dayAndDateObj.dateObj);
				}
			}
		} else if (!isZeroDate(startDate()) && !isZeroDate(endDate())) {
			if (!isZeroDate($$props.dayAndDateObj.dateObj)) {
				startDate($$props.dayAndDateObj.dateObj);
				endDate(getZeroDate());
			}
		}
	};

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.child(div_1);
	var button = $.child(div_2);
	var span = $.child(button);
	var text = $.only_child(span, true);

	$.reset(button);
	$.reset(div_2);
	$.reset(div_1);

	$.template_effect(() => {
		$.set_class(div, 1, `absolute top-0 left-0 z-[0.1] h-full w-full ${$.get(rangeBg) ?? ''}`);
		$.set_class(div_1, 1, `z-1 h-10 w-10 transition-colors lg:h-8.5 lg:w-8.5 ${$.get(dayBg) ?? ''}`);
		$.set_class(span, 1, `text-xs transition-colors ${$.get(dayText) ?? ''} font-normal tracking-[0.06px]`);
		$.set_text(text, $$props.dayAndDateObj.day);
	});

	$.delegated('click', button, onclick);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);