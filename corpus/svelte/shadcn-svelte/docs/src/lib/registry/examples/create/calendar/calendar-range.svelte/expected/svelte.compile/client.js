import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLocalTimeZone } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Calendar_range($$anchor, $$props) {
	$.push($$props, true);

	Example($$anchor, {
		title: 'Range',
		containerClass: 'lg:col-span-full 2xl:col-span-full',
		class: 'p-12',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto w-fit p-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'p-0',
								children: ($$anchor, $$slotProps) => {
									RangeCalendar($$anchor, {
										numberOfMonths: 2,
										isDateUnavailable: (date) => {
											const dateObj = date.toDate(getLocalTimeZone());

											return dateObj > new Date() || dateObj < new Date("1900-01-01");
										}
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}