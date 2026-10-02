import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<div><!> <!></div> <span>-</span> <div><!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Calendar_17($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy(new CalendarDate(2025, 6, 12)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'w-fit py-4',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'px-4',
						children: ($$anchor, $$slotProps) => {
							Calendar($$anchor, {
								type: 'single',
								class: 'bg-transparent p-0 [--cell-size:--spacing(10.5)]',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex gap-2 border-t px-4 !pt-4 *:[div]:w-full',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var div = $.first_child(fragment_3);
							var node_3 = $.child(div);

							Label(node_3, {
								for: 'time-from',
								class: 'sr-only',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Start Time');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Input(node_4, {
								id: 'time-from',
								type: 'time',
								step: '1',
								value: '10:30:00',
								class: 'appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
							});

							$.reset(div);

							var div_1 = $.sibling(div, 4);
							var node_5 = $.child(div_1);

							Label(node_5, {
								for: 'time-to',
								class: 'sr-only',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('End Time');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Input(node_6, {
								id: 'time-to',
								type: 'time',
								step: '1',
								value: '12:30:00',
								class: 'appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
							});

							$.reset(div_1);
							$.append($$anchor, fragment_3);
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