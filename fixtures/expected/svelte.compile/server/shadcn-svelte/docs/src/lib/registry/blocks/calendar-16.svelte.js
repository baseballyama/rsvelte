import * as $ from 'svelte/internal/server';
import Clock2Icon from "@lucide/svelte/icons/clock-2";
import { CalendarDate } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Calendar_16($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
								class: 'flex flex-col gap-6 border-t px-4 !pt-4',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex w-full flex-col gap-3">`);

									Label($$renderer, {
										for: 'time-from',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Start Time`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="relative flex w-full items-center gap-2">`);

									Clock2Icon($$renderer, {
										class: 'pointer-events-none absolute start-2.5 size-4 text-muted-foreground select-none'
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'time-from',
										type: 'time',
										step: '1',
										value: '10:30:00',
										class: 'appearance-none ps-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
									});

									$$renderer.push(`<!----></div></div> <div class="flex w-full flex-col gap-3">`);

									Label($$renderer, {
										for: 'time-to',
										children: ($$renderer) => {
											$$renderer.push(`<!---->End Time`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="relative flex w-full items-center gap-2">`);

									Clock2Icon($$renderer, {
										class: 'pointer-events-none absolute start-2.5 size-4 text-muted-foreground select-none'
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'time-to',
										type: 'time',
										step: '1',
										value: '12:30:00',
										class: 'appearance-none ps-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
									});

									$$renderer.push(`<!----></div></div>`);
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