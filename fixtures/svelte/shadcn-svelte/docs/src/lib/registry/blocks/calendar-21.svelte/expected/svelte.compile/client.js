import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate, isWeekend } from "@internationalized/date";
import RangeCalendarDay from "$lib/registry/ui/range-calendar/range-calendar-day.svelte";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(` <!>`, 1);

export default function Calendar_21($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy({
		start: new CalendarDate(2025, 6, 12),
		end: new CalendarDate(2025, 6, 17)
	}));

	{
		const day = ($$anchor, $$arg0) => {
			let day = () => ($$arg0?.()).day;
			let outsideMonth = () => ($$arg0?.()).outsideMonth;
			const dayIsWeekend = $.derived(() => isWeekend(day(), "en-US"));

			RangeCalendarDay($$anchor, {
				class: 'flex flex-col items-center',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root_1();
					var text = $.first_child(fragment_2);
					var node = $.sibling(text);

					{
						var consequent = ($$anchor) => {
							var span = root();
							var text_1 = $.only_child(span, true);

							$.template_effect(() => $.set_text(text_1, $.get(dayIsWeekend) ? "$220" : "$100"));
							$.append($$anchor, span);
						};

						$.if(node, ($$render) => {
							if (!outsideMonth()) $$render(consequent);
						});
					}

					$.template_effect(() => $.set_text(text, `${day().day ?? ''} `));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		RangeCalendar($$anchor, {
			class: 'rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]',
			monthFormat: 'long',
			captionLayout: 'dropdown',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			day,
			$$slots: { day: true }
		});
	}

	$.pop();
}