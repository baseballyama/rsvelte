import * as $ from 'svelte/internal/server';
import CalendarMonthSelect from './calendar-month-select.svelte';
import CalendarYearSelect from './calendar-year-select.svelte';
import { DateFormatter, getLocalTimeZone } from '@internationalized/date';

export default function Calendar_caption($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			captionLayout,
			months,
			monthFormat,
			years,
			yearFormat,
			month,
			locale,
			placeholder = void 0,
			monthIndex = 0
		} = $$props;

		function formatYear(date) {
			const dateObj = date.toDate(getLocalTimeZone());

			if (typeof yearFormat === 'function') return yearFormat(dateObj.getFullYear());

			return new DateFormatter(locale, { year: yearFormat }).format(dateObj);
		}

		function formatMonth(date) {
			const dateObj = date.toDate(getLocalTimeZone());

			if (typeof monthFormat === 'function') return monthFormat(dateObj.getMonth() + 1);

			return new DateFormatter(locale, { month: monthFormat }).format(dateObj);
		}

		function MonthSelect($$renderer) {
			CalendarMonthSelect($$renderer, {
				months,
				monthFormat,
				value: month.month,
				onchange: (e) => {
					if (!placeholder) return;

					const v = Number.parseInt(e.currentTarget.value);
					const newPlaceholder = placeholder.set({ month: v });

					placeholder = newPlaceholder.subtract({ months: monthIndex });
				}
			});
		}

		function YearSelect($$renderer) {
			CalendarYearSelect($$renderer, { years, yearFormat, value: month.year });
		}

		if (captionLayout === 'dropdown') {
			$$renderer.push('<!--[0-->');
			MonthSelect($$renderer);
			$$renderer.push(`<!----> `);
			YearSelect($$renderer);
			$$renderer.push(`<!---->`);
		} else if (captionLayout === 'dropdown-months') {
			$$renderer.push('<!--[1-->');
			MonthSelect($$renderer);
			$$renderer.push(`<!----> `);

			if (placeholder) {
				$$renderer.push(`<!--[0-->${$.escape(formatYear(placeholder))}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else if (captionLayout === 'dropdown-years') {
			$$renderer.push('<!--[2-->');

			if (placeholder) {
				$$renderer.push(`<!--[0-->${$.escape(formatMonth(placeholder))}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			YearSelect($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(formatMonth(month))} ${$.escape(formatYear(month))}`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { placeholder });
	});
}