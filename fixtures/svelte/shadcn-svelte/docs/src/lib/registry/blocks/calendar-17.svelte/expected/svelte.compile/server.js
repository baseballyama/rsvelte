import * as $ from 'svelte/internal/server';
import { CalendarDate } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Calendar_17($$renderer, $$props) {
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
										class: 'bg-transparent p-0 [--cell-size:--spacing(10.5)]',
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
								class: 'flex gap-2 border-t px-4 !pt-4 *:[div]:w-full',
								children: ($$renderer) => {
									$$renderer.push(`<div>`);

									Label($$renderer, {
										for: 'time-from',
										class: 'sr-only',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Start Time`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'time-from',
										type: 'time',
										step: '1',
										value: '10:30:00',
										class: 'appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
									});

									$$renderer.push(`<!----></div> <span>-</span> <div>`);

									Label($$renderer, {
										for: 'time-to',
										class: 'sr-only',
										children: ($$renderer) => {
											$$renderer.push(`<!---->End Time`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'time-to',
										type: 'time',
										step: '1',
										value: '12:30:00',
										class: 'appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
									});

									$$renderer.push(`<!----></div>`);
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