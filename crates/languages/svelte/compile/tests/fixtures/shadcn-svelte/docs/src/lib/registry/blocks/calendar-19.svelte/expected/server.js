import * as $ from 'svelte/internal/server';
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Calendar_19($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let todayDate = today(getLocalTimeZone());
		let value = new CalendarDate(2025, 6, 12);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'max-w-[300px] py-4',
					children: ($$renderer) => {
						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: 'px-4',
								children: ($$renderer) => {
									Calendar($$renderer, {
										type: 'single',
										class: 'bg-transparent p-0 [--cell-size:--spacing(9.5)]',
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
								class: 'flex flex-wrap gap-2 border-t px-4 !pt-4',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like([
										{ label: "Today", value: 0 },
										{ label: "Tomorrow", value: 1 },
										{ label: "In 3 days", value: 3 },
										{ label: "In a week", value: 7 },
										{ label: "In 2 weeks", value: 14 }
									]);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let preset = each_array[$$index];

										Button($$renderer, {
											variant: 'outline',
											size: 'sm',
											class: 'flex-1',
											onclick: () => {
												value = todayDate?.add({ days: preset.value });
											},

											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(preset.label)}`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
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