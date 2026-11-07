import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";

export default function Calendar($$anchor, $$props) {
	$.push($$props, true);

	const start = new CalendarDate(2025, 6, 5);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'hidden max-w-[260px] p-0 sm:flex',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'p-0',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => ({ start, end: start.add({ days: 8 }) }));

								RangeCalendar($$anchor, {
									get placeholder() {
										return start;
									},

									get value() {
										return $.get($0);
									}
								});
							}
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}