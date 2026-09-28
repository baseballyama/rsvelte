import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Clock2Icon from "@lucide/svelte/icons/clock-2";
import { CalendarDate } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<div class="flex w-full flex-col gap-3"><!> <div class="relative flex w-full items-center gap-2"><!> <!></div></div> <div class="flex w-full flex-col gap-3"><!> <div class="relative flex w-full items-center gap-2"><!> <!></div></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Calendar_16($$anchor, $$props) {
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
								class: 'bg-transparent p-0',
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
						class: 'flex flex-col gap-6 border-t px-4 !pt-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var div = $.first_child(fragment_3);
							var node_3 = $.child(div);

							Label(node_3, {
								for: 'time-from',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Start Time');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var div_1 = $.sibling(node_3, 2);
							var node_4 = $.child(div_1);

							Clock2Icon(node_4, {
								class: 'pointer-events-none absolute start-2.5 size-4 text-muted-foreground select-none'
							});

							var node_5 = $.sibling(node_4, 2);

							Input(node_5, {
								id: 'time-from',
								type: 'time',
								step: '1',
								value: '10:30:00',
								class: 'appearance-none ps-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
							});

							$.reset(div_1);
							$.reset(div);

							var div_2 = $.sibling(div, 2);
							var node_6 = $.child(div_2);

							Label(node_6, {
								for: 'time-to',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('End Time');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var div_3 = $.sibling(node_6, 2);
							var node_7 = $.child(div_3);

							Clock2Icon(node_7, {
								class: 'pointer-events-none absolute start-2.5 size-4 text-muted-foreground select-none'
							});

							var node_8 = $.sibling(node_7, 2);

							Input(node_8, {
								id: 'time-to',
								type: 'time',
								step: '1',
								value: '12:30:00',
								class: 'appearance-none ps-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
							});

							$.reset(div_3);
							$.reset(div_2);
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