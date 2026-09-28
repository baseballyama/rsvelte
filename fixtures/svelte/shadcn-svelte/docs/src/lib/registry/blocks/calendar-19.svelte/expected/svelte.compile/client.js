import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Calendar_19($$anchor, $$props) {
	$.push($$props, true);

	let todayDate = today(getLocalTimeZone());
	let value = $.state($.proxy(new CalendarDate(2025, 6, 12)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'max-w-[300px] py-4',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'px-4',
						children: ($$anchor, $$slotProps) => {
							Calendar($$anchor, {
								type: 'single',
								class: 'bg-transparent p-0 [--cell-size:--spacing(9.5)]',
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
						class: 'flex flex-wrap gap-2 border-t px-4 !pt-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.each(
								node_3,
								16,
								() => [
									{ label: "Today", value: 0 },
									{ label: "Tomorrow", value: 1 },
									{ label: "In 3 days", value: 3 },
									{ label: "In a week", value: 7 },
									{ label: "In 2 weeks", value: 14 }
								],
								(preset) => preset.value,
								($$anchor, preset) => {
									Button($$anchor, {
										variant: 'outline',
										size: 'sm',
										class: 'flex-1',
										onclick: () => {
											$.set(value, todayDate?.add({ days: preset.value }), true);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, preset.label));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								}
							);

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