import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PlusIcon from "@lucide/svelte/icons/plus";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { formatDateRange } from "little-date";
import * as Card from "$lib/registry/ui/card/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <span class="sr-only">Add Event</span>`, 1);
var root_1 = $.from_html(`<div class="relative rounded-md bg-muted p-2 ps-6 text-sm after:absolute after:inset-y-2 after:start-2 after:w-1 after:rounded-full after:bg-primary/70"><div class="font-medium"> </div> <div class="text-xs text-muted-foreground"> </div></div>`);
var root_2 = $.from_html(`<div class="flex w-full items-center justify-between px-1"><div class="text-sm font-medium"> </div> <!></div> <div class="flex w-full flex-col gap-2"></div>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Calendar_31($$anchor, $$props) {
	$.push($$props, true);

	const events = [
		{
			title: "Team Sync Meeting",
			start: "2025-06-12T09:00:00",
			end: "2025-06-12T10:00:00"
		},

		{
			title: "Design Review",
			start: "2025-06-12T11:30:00",
			end: "2025-06-12T12:30:00"
		},

		{
			title: "Client Presentation",
			start: "2025-06-12T14:00:00",
			end: "2025-06-12T15:00:00"
		}
	];

	let value = $.state($.proxy(new CalendarDate(2025, 6, 12)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'w-fit py-4',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'px-4',
						children: ($$anchor, $$slotProps) => {
							Calendar($$anchor, {
								type: 'single',
								class: 'bg-transparent p-0',
								preventDeselect: true,
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
						class: 'flex flex-col items-start gap-3 border-t px-4 !pt-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var div = $.first_child(fragment_3);
							var div_1 = $.child(div);
							var text = $.only_child(div_1, true);
							var node_3 = $.sibling(div_1, 2);

							Button(node_3, {
								variant: 'ghost',
								size: 'icon',
								class: 'size-6',
								title: 'Add Event',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_4 = $.first_child(fragment_4);

									PlusIcon(node_4, {});
									$.next(2);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							$.reset(div);

							var div_2 = $.sibling(div, 2);

							$.each(div_2, 21, () => events, (event) => event.title, ($$anchor, event) => {
								var div_3 = root_1();
								var div_4 = $.child(div_3);
								var text_1 = $.only_child(div_4, true);
								var div_5 = $.sibling(div_4, 2);
								var text_2 = $.only_child(div_5, true);

								$.reset(div_3);

								$.template_effect(
									($0) => {
										$.set_text(text_1, $.get(event).title);
										$.set_text(text_2, $0);
									},
									[
										() => formatDateRange(new Date($.get(event).start), new Date($.get(event).end))
									]
								);

								$.append($$anchor, div_3);
							});

							$.reset(div_2);

							$.template_effect(($0) => $.set_text(text, $0), [
								() => $.get(value)?.toDate(getLocalTimeZone()).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
							]);

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