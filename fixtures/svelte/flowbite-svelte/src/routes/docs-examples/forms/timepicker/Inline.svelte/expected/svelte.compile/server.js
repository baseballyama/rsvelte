import * as $ from 'svelte/internal/server';

import {
	Label,
	Datepicker,
	Timepicker,
	Button,
	Accordion,
	AccordionItem,
	Avatar,
	Input
} from "flowbite-svelte";

import { CalendarMonthSolid, ClockSolid, MapPinSolid } from "flowbite-svelte-icons";

export default function Inline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedDate = new Date("2024-06-30");
		let selectedInlineTime = { time: "12:00" };
		let eventTitle = "Digital Transformation";
		let eventLocation = "California, USA";
		let eventDuration = "30 min";
		let eventType = "Web conference";

		let participants = [
			{ img: "/images/profile-picture-1.webp", alt: "Participant 1" },
			{ img: "/images/profile-picture-2.webp", alt: "Participant 2" },
			{ img: "/images/profile-picture-3.webp", alt: "Participant 3" }
		];

		const timeIntervals = [
			"10:00",
			"10:30",
			"11:00",
			"11:30",
			"12:00",
			"12:30",
			"13:00",
			"13:30",
			"14:00",
			"14:30",
			"15:00",
			"15:30"
		];

		function handleTimeSelect(data) {
			if (data) {
				selectedInlineTime = { time: data.time };
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mx-auto max-w-2xl rounded-lg bg-white shadow-md dark:bg-gray-800"><div class="p-6"><h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">${$.escape(eventTitle)}</h2> <div class="mb-6 flex flex-wrap gap-4"><div class="flex items-center">`);
			CalendarMonthSolid($$renderer, { class: 'mr-2 h-5 w-5 text-gray-500 dark:text-gray-400' });
			$$renderer.push(`<!----> <span class="text-gray-900 dark:text-white">${$.escape(selectedDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }))}</span></div> <div class="flex items-center">`);
			ClockSolid($$renderer, { class: 'mr-2 h-5 w-5 text-gray-500 dark:text-gray-400' });
			$$renderer.push(`<!----> <span class="text-gray-900 dark:text-white">${$.escape(selectedInlineTime.time)}</span></div> <div class="flex items-center">`);
			MapPinSolid($$renderer, { class: 'mr-2 h-5 w-5 text-gray-500 dark:text-gray-400' });
			$$renderer.push(`<!----> <span class="text-gray-900 dark:text-white">${$.escape(eventLocation)}</span></div></div> <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3"><div>`);

			Label($$renderer, {
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Participants`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex -space-x-4"><!--[-->`);

			const each_array = $.ensure_array_like(participants);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let participant = each_array[$$index];

				Avatar($$renderer, { src: participant.img, alt: participant.alt });
			}

			$$renderer.push(`<!--]--> `);

			Avatar($$renderer, {
				class: 'bg-gray-700 text-white',
				children: ($$renderer) => {
					$$renderer.push(`<!---->+99`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <div>`);

			Label($$renderer, {
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Duration`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <span class="text-lg font-medium text-gray-900 dark:text-white">${$.escape(eventDuration)}</span></div> <div>`);

			Label($$renderer, {
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Meeting Type`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <span class="text-lg font-medium text-gray-900 dark:text-white">${$.escape(eventType)}</span></div></div> <div class="border-t border-gray-200 pt-6 dark:border-gray-700"><div class="grid grid-cols-1 gap-6 md:grid-cols-2"><div>`);

			Label($$renderer, {
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Select Date`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Datepicker($$renderer, {
				inline: true,
				get value() {
					return selectedDate;
				},

				set value($$value) {
					selectedDate = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div>`);

			Label($$renderer, {
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Select Time`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Timepicker($$renderer, {
				type: 'inline-buttons',
				value: selectedInlineTime.time,
				timeIntervals,
				onselect: handleTimeSelect
			});

			$$renderer.push(`<!----></div></div></div></div> `);

			Accordion($$renderer, {
				flush: true,
				children: ($$renderer) => {
					{
						function header($$renderer) {
							$$renderer.push(`<!---->Additional Options`);
						}

						AccordionItem($$renderer, {
							class: 'p-2',
							header,
							children: ($$renderer) => {
								$$renderer.push(`<div class="space-y-4 p-4"><div>`);

								Label($$renderer, {
									for: 'event-title',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Event Title`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'event-title',
									get value() {
										return eventTitle;
									},

									set value($$value) {
										eventTitle = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div> <div>`);

								Label($$renderer, {
									for: 'event-location',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Location`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'event-location',
									get value() {
										return eventLocation;
									},

									set value($$value) {
										eventLocation = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div> <div>`);

								Label($$renderer, {
									for: 'event-duration',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Duration`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'event-duration',
									get value() {
										return eventDuration;
									},

									set value($$value) {
										eventDuration = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div> <div>`);

								Label($$renderer, {
									for: 'event-type',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Meeting Type`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'event-type',
									get value() {
										return eventType;
									},

									set value($$value) {
										eventType = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div></div>`);
							},
							$$slots: { header: true, default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="border-t border-gray-200 p-6 dark:border-gray-700">`);

			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Schedule Event`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}