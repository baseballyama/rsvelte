import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Calendar_with_presets($$anchor, $$props) {
	$.push($$props, true);

	const currentDate = today(getLocalTimeZone());
	let date = $.state($.proxy(new CalendarDate(currentDate.year, 1, 12)));

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let currentMonth = $.state($.proxy(new CalendarDate(currentDate.year, currentDate.month, 1)));

	const presets = [
		{ label: "Today", value: 0 },
		{ label: "Tomorrow", value: 1 },
		{ label: "In 3 days", value: 3 },
		{ label: "In a week", value: 7 },
		{ label: "In 2 weeks", value: 14 }
	];

	Example($$anchor, {
		title: 'With Presets',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto w-fit max-w-[300px]',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Calendar($$anchor, {
										type: 'single',
										fixedWeeks: true,
										class: 'p-0 [--cell-size:--spacing(9.5)]',
										get value() {
											return $.get(date);
										},

										set value($$value) {
											$.set(date, $$value, true);
										}
									});
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex flex-wrap gap-2 border-t',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.each(node_3, 17, () => presets, (preset) => preset.value, ($$anchor, preset) => {
										Button($$anchor, {
											variant: 'outline',
											size: 'sm',
											class: 'flex-1',
											onclick: () => {
												const newDate = currentDate.add({ days: $.get(preset).value });

												$.set(date, newDate, true);
												$.set(currentMonth, new CalendarDate(newDate.year, newDate.month, 1), true);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, $.get(preset).label));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
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