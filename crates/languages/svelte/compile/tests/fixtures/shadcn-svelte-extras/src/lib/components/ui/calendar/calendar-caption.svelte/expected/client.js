import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarMonthSelect from './calendar-month-select.svelte';
import CalendarYearSelect from './calendar-year-select.svelte';
import { DateFormatter, getLocalTimeZone } from '@internationalized/date';

var root = $.from_html(`<!> <!>`, 1);

export default function Calendar_caption($$anchor, $$props) {
	$.push($$props, true);

	const MonthSelect = ($$anchor) => {
		CalendarMonthSelect($$anchor, {
			get months() {
				return $$props.months;
			},

			get monthFormat() {
				return $$props.monthFormat;
			},

			get value() {
				return $$props.month.month;
			},

			onchange: (e) => {
				if (!placeholder()) return;

				const v = Number.parseInt(e.currentTarget.value);
				const newPlaceholder = placeholder().set({ month: v });

				placeholder(newPlaceholder.subtract({ months: monthIndex() }));
			}
		});
	};

	const YearSelect = ($$anchor) => {
		CalendarYearSelect($$anchor, {
			get years() {
				return $$props.years;
			},

			get yearFormat() {
				return $$props.yearFormat;
			},

			get value() {
				return $$props.month.year;
			}
		});
	};

	let placeholder = $.prop($$props, 'placeholder', 15),
		monthIndex = $.prop($$props, 'monthIndex', 3, 0);

	function formatYear(date) {
		const dateObj = date.toDate(getLocalTimeZone());

		if (typeof $$props.yearFormat === 'function') return $$props.yearFormat(dateObj.getFullYear());

		return new DateFormatter($$props.locale, { year: $$props.yearFormat }).format(dateObj);
	}

	function formatMonth(date) {
		const dateObj = date.toDate(getLocalTimeZone());

		if (typeof $$props.monthFormat === 'function') return $$props.monthFormat(dateObj.getMonth() + 1);

		return new DateFormatter($$props.locale, { month: $$props.monthFormat }).format(dateObj);
	}

	var fragment_2 = $.comment();
	var node = $.first_child(fragment_2);

	{
		var consequent = ($$anchor) => {
			var fragment_3 = root();
			var node_1 = $.first_child(fragment_3);

			MonthSelect(node_1);

			var node_2 = $.sibling(node_1, 2);

			YearSelect(node_2);
			$.append($$anchor, fragment_3);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_4 = root();
			var node_3 = $.first_child(fragment_4);

			MonthSelect(node_3);

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent_1 = ($$anchor) => {
					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => formatYear(placeholder())]);
					$.append($$anchor, text);
				};

				$.if(node_4, ($$render) => {
					if (placeholder()) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_4);
		};

		var consequent_4 = ($$anchor) => {
			var fragment_6 = root();
			var node_5 = $.first_child(fragment_6);

			{
				var consequent_3 = ($$anchor) => {
					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, $0), [() => formatMonth(placeholder())]);
					$.append($$anchor, text_1);
				};

				$.if(node_5, ($$render) => {
					if (placeholder()) $$render(consequent_3);
				});
			}

			var node_6 = $.sibling(node_5, 2);

			YearSelect(node_6);
			$.append($$anchor, fragment_6);
		};

		var alternate = ($$anchor) => {
			var text_2 = $.text();

			$.template_effect(($0, $1) => $.set_text(text_2, `${$0 ?? ''} ${$1 ?? ''}`), [
				() => formatMonth($$props.month),
				() => formatYear($$props.month)
			]);

			$.append($$anchor, text_2);
		};

		$.if(node, ($$render) => {
			if ($$props.captionLayout === 'dropdown') $$render(consequent); else if ($$props.captionLayout === 'dropdown-months') $$render(consequent_2, 1); else if ($$props.captionLayout === 'dropdown-years') $$render(consequent_4, 2); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_2);
	$.pop();
}