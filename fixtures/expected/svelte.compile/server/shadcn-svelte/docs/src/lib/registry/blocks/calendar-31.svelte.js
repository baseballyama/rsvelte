import * as $ from 'svelte/internal/server';
import PlusIcon from "@lucide/svelte/icons/plus";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { formatDateRange } from "little-date";
import * as Card from "$lib/registry/ui/card/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Calendar_31($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let value = new CalendarDate(2025, 6, 12);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'w-fit py-4',
					children: ($$renderer) => {
						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: 'px-4',
								children: ($$renderer) => {
									Calendar($$renderer, {
										type: 'single',
										class: 'bg-transparent p-0',
										preventDeselect: true,
										get value() {
											return value;
										},

										set value($$value) {
											value = $$value;
											$$settled = false;
										}
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								class: 'flex flex-col items-start gap-3 border-t px-4 !pt-4',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex w-full items-center justify-between px-1"><div class="text-sm font-medium">${$.escape(value?.toDate(getLocalTimeZone()).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }))}</div> `);

									Button($$renderer, {
										variant: 'ghost',
										size: 'icon',
										class: 'size-6',
										title: 'Add Event',
										children: ($$renderer) => {
											PlusIcon($$renderer, {});
											$$renderer.push(`<!----> <span class="sr-only">Add Event</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div> <div class="flex w-full flex-col gap-2"><!--[-->`);

									const each_array = $.ensure_array_like(events);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let event = each_array[$$index];

										$$renderer.push(`<div class="relative rounded-md bg-muted p-2 ps-6 text-sm after:absolute after:inset-y-2 after:start-2 after:w-1 after:rounded-full after:bg-primary/70"><div class="font-medium">${$.escape(event.title)}</div> <div class="text-xs text-muted-foreground">${$.escape(formatDateRange(new Date(event.start), new Date(event.end)))}</div></div>`);
									}

									$$renderer.push(`<!--]--></div>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}