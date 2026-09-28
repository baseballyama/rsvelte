import * as $ from 'svelte/internal/server';
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Calendar_20($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = new CalendarDate(2025, 6, 12);
		let selectedTime = "10:00";
		const bookedDates = Array.from({ length: 3 }, (_, i) => new CalendarDate(2025, 6, 17 + i));

		const timeSlots = Array.from({ length: 37 }, (_, i) => {
			const totalMinutes = i * 15;
			const hour = Math.floor(totalMinutes / 60) + 9;
			const minute = totalMinutes % 60;

			return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'gap-0 p-0',
					children: ($$renderer) => {
						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: 'relative p-0 md:pe-48',
								children: ($$renderer) => {
									$$renderer.push(`<div class="p-6">`);

									Calendar($$renderer, {
										type: 'single',
										isDateUnavailable: (date) => bookedDates.some((d) => d.compare(date) === 0),
										class: 'bg-transparent p-0 [--cell-size:--spacing(10)] data-unavailable:line-through data-unavailable:opacity-100 md:[--cell-size:--spacing(12)] [&_[data-outside-month]]:hidden',
										weekdayFormat: 'short',
										get value() {
											return value;
										},

										set value($$value) {
											value = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="inset-y-0 end-0 no-scrollbar flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-s md:border-t-0"><div class="grid gap-2"><!--[-->`);

									const each_array = $.ensure_array_like(timeSlots);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let time = each_array[$$index];

										Button($$renderer, {
											variant: selectedTime === time ? "default" : "outline",
											onclick: () => selectedTime = time,
											class: 'w-full shadow-none',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(time)}`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]--></div></div>`);
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
								class: 'flex flex-col gap-4 border-t px-6 !py-5 md:flex-row',
								children: ($$renderer) => {
									$$renderer.push(`<div class="text-sm">`);

									if (value && selectedTime) {
										$$renderer.push(`<!--[0-->Your meeting is booked for <span class="font-medium">${$.escape(value.toDate(getLocalTimeZone()).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" }))}</span> at <span class="font-medium">${$.escape(selectedTime)}</span>.`);
									} else {
										$$renderer.push(`<!--[-1-->Select a date and time for your meeting.`);
									}

									$$renderer.push(`<!--]--></div> `);

									Button($$renderer, {
										disabled: !value || !selectedTime,
										class: 'w-full md:ms-auto md:w-auto',
										variant: 'outline',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Continue`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
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