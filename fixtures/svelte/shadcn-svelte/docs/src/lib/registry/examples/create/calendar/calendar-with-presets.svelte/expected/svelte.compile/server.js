import * as $ from 'svelte/internal/server';
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Calendar_with_presets($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const currentDate = today(getLocalTimeZone());
		let date = new CalendarDate(currentDate.year, 1, 12);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		let currentMonth = new CalendarDate(currentDate.year, currentDate.month, 1);

		const presets = [
			{ label: "Today", value: 0 },
			{ label: "Tomorrow", value: 1 },
			{ label: "In 3 days", value: 3 },
			{ label: "In a week", value: 7 },
			{ label: "In 2 weeks", value: 14 }
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'With Presets',
				children: ($$renderer) => {
					if (Card.Root) {
						$$renderer.push('<!--[-->');

						Card.Root($$renderer, {
							class: 'mx-auto w-fit max-w-[300px]',
							size: 'sm',
							children: ($$renderer) => {
								if (Card.Content) {
									$$renderer.push('<!--[-->');

									Card.Content($$renderer, {
										children: ($$renderer) => {
											Calendar($$renderer, {
												type: 'single',
												fixedWeeks: true,
												class: 'p-0 [--cell-size:--spacing(9.5)]',
												get value() {
													return date;
												},

												set value($$value) {
													date = $$value;
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
										class: 'flex flex-wrap gap-2 border-t',
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(presets);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let preset = each_array[$$index];

												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													class: 'flex-1',
													onclick: () => {
														const newDate = currentDate.add({ days: preset.value });

														date = newDate;
														currentMonth = new CalendarDate(newDate.year, newDate.month, 1);
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
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}