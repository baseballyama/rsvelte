import * as $ from 'svelte/internal/server';
import { CalendarDate } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";

export default function Calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const start = new CalendarDate(2025, 6, 5);

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				class: 'hidden max-w-[260px] p-0 sm:flex',
				children: ($$renderer) => {
					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'p-0',
							children: ($$renderer) => {
								RangeCalendar($$renderer, {
									placeholder: start,
									value: { start, end: start.add({ days: 8 }) }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}