import * as $ from 'svelte/internal/server';

import {
	getZeroDate,
	isInDateRange,
	isStartDateGreaterThanEndDate,
	isWeekend,
	isZeroDate
} from "$lib/utils/calendar.js";

export default function Weekday($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			dayAndDateObj,
			startDate = getZeroDate(),
			endDate = getZeroDate()
		} = $$props;

		const isToday = (date) => {
			const today = new Date();

			return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
		};

		const isHighlighteble = (date) => {
			if (!isZeroDate(date)) {
				if (!isZeroDate(startDate) || !isZeroDate(endDate)) {
					if (date.getDate() === startDate.getDate() && date.getMonth() === startDate.getMonth() && date.getFullYear() === startDate.getFullYear() || date.getDate() === endDate.getDate() && date.getMonth() === endDate.getMonth() && date.getFullYear() === endDate.getFullYear()) {
						return true;
					}
				}
			}

			return false;
		};

		const isRangeHighlighteble = () => {
			if (!isZeroDate(dayAndDateObj.dateObj) && !isZeroDate(startDate) && !isZeroDate(endDate)) {
				if (isInDateRange(dayAndDateObj.dateObj, startDate, endDate)) {
					return true;
				}
			}

			return false;
		};

		const dayBg = $.derived(() => {
			if (isHighlighteble(dayAndDateObj.dateObj)) {
				return `rounded-sm bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000`;
			}

			if (isToday(dayAndDateObj.dateObj)) {
				return `rounded-sm bg-kui-light-blue-900 dark:bg-kui-dark-blue-900`;
			}

			return "";
		});

		const dayText = $.derived(() => {
			if (isHighlighteble(dayAndDateObj.dateObj)) {
				return `text-kui-light-bg dark:text-kui-dark-bg`;
			}

			if (isToday(dayAndDateObj.dateObj)) {
				return `text-kui-light-bg dark:text-kui-dark-bg`;
			}

			if (isRangeHighlighteble() && !isWeekend(dayAndDateObj.dateObj)) {
				return "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000";
			}

			if (isWeekend(dayAndDateObj.dateObj)) {
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
			if (isZeroDate(startDate) && isZeroDate(endDate)) {
				if (!isZeroDate(dayAndDateObj.dateObj)) {
					startDate = dayAndDateObj.dateObj;
				}
			} else if (!isZeroDate(startDate) && isZeroDate(endDate)) {
				if (!isZeroDate(dayAndDateObj.dateObj)) {
					// an edge ace. if the date selected as end date is less than
					// the start date, swap the two dates
					if (isStartDateGreaterThanEndDate(startDate, dayAndDateObj.dateObj)) {
						endDate = startDate;
						startDate = dayAndDateObj.dateObj;
					} else {
						endDate = dayAndDateObj.dateObj;
					}
				}
			} else if (!isZeroDate(startDate) && !isZeroDate(endDate)) {
				if (!isZeroDate(dayAndDateObj.dateObj)) {
					startDate = dayAndDateObj.dateObj;
					endDate = getZeroDate();
				}
			}
		};

		$$renderer.push(`<div${$.attr_class(`absolute top-0 left-0 z-[0.1] h-full w-full ${$.stringify(rangeBg())}`)}></div> <div${$.attr_class(`z-1 h-10 w-10 transition-colors lg:h-8.5 lg:w-8.5 ${$.stringify(dayBg())}`)}><div class="flex h-full w-full justify-center"><button class="flex h-full w-full items-center justify-center rounded-xs"><span${$.attr_class(`text-xs transition-colors ${$.stringify(dayText())} font-normal tracking-[0.06px]`)}>${$.escape(dayAndDateObj.day)}</span></button></div></div>`);
		$.bind_props($$props, { startDate, endDate });
	});
}