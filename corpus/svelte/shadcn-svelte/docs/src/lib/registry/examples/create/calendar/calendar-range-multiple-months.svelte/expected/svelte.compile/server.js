import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Calendar_range_multiple_months($$renderer) {
	Example($$renderer, {
		title: 'Range Multiple Months',
		containerClass: 'lg:col-span-full 2xl:col-span-full',
		class: 'p-12',
		children: ($$renderer) => {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'mx-auto w-fit p-0',
					children: ($$renderer) => {
						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: 'p-0',
								children: ($$renderer) => {
									RangeCalendar($$renderer, { numberOfMonths: 3, locale: 'es', fixedWeeks: true });
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
		},
		$$slots: { default: true }
	});
}