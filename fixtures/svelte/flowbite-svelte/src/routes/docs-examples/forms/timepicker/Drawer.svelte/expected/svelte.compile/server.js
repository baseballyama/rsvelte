import * as $ from 'svelte/internal/server';

import {
	Button,
	Drawer,
	Label,
	Select,
	Toggle,
	Checkbox,
	Timepicker,
	Card,
	P,
	Heading,
	Span
} from "flowbite-svelte";

import { InfoCircleSolid, ClockSolid, PlusOutline, TrashBinSolid } from "flowbite-svelte-icons";

export default function Drawer_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let businessHoursEnabled = true;
		let selectedTimezoneDrawer = "";

		let workingDays = [
			{
				day: "Mon",
				enabled: true,
				startTime: "09:00",
				endTime: "17:00"
			},

			{
				day: "Tue",
				enabled: false,
				startTime: "09:00",
				endTime: "17:00"
			},

			{
				day: "Wed",
				enabled: true,
				startTime: "09:00",
				endTime: "17:00"
			},

			{
				day: "Thu",
				enabled: false,
				startTime: "09:00",
				endTime: "17:00"
			},

			{
				day: "Fri",
				enabled: false,
				startTime: "09:00",
				endTime: "17:00"
			}
		];

		const drawerTimezones = [
			{
				value: "America/New_York",
				name: "EST (Eastern Standard Time) - GMT-5 (New York)"
			},

			{
				value: "America/Los_Angeles",
				name: "PST (Pacific Standard Time) - GMT-8 (Los Angeles)"
			},

			{
				value: "Europe/London",
				name: "GMT (Greenwich Mean Time) - GMT+0 (London)"
			},

			{
				value: "Europe/Berlin",
				name: "CET (Central European Time) - GMT+1 (Berlin)"
			},

			{
				value: "Asia/Tokyo",
				name: "JST (Japan Standard Time) - GMT+9 (Tokyo)"
			}
		];

		let sortedWorkingDays = $.derived(() => [...workingDays].sort((a, b) => {
			const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

			return days.indexOf(a.day) - days.indexOf(b.day);
		}));

		function toggleDay(index) {
			workingDays[index].enabled = !workingDays[index].enabled;
			workingDays = [...workingDays];
		}

		function handleTimeChange(index, isStartTime, event) {
			const newTime = isStartTime ? event.time : event.endTime;

			if (isStartTime) {
				workingDays[index].startTime = newTime;
			} else {
				workingDays[index].endTime = newTime;
			}

			workingDays = [...workingDays];
		}

		function addInterval() {
			const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
			const existingDays = new Set(workingDays.map((d) => d.day));
			const availableDays = days.filter((d) => !existingDays.has(d));

			if (availableDays.length > 0) {
				workingDays = [
					...workingDays,
					{
						day: availableDays[0],
						enabled: true,
						startTime: "09:00",
						endTime: "17:00"
					}
				];
			}
		}

		function removeInterval(index) {
			workingDays = workingDays.filter((_, i) => i !== index);
		}

		function saveAll(e) {
			e.preventDefault();
			console.log("Saving settings:", { businessHoursEnabled, selectedTimezoneDrawer, workingDays });
			open = false;
		}

		const timepickerClasses = {
			divClass: "inline-flex rounded-lg shadow-sm text-xs sm:text-sm w-full sm:w-auto",
			inputClass: "block disabled:cursor-not-allowed disabled:opacity-50 p-1.5 sm:p-2.5 text-xs sm:text-sm border-r-0 focus:ring-0 focus:outline-none"
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex justify-center">`);

			Button($$renderer, {
				onclick: () => open = true,
				class: 'transform transition-all hover:scale-105',
				children: ($$renderer) => {
					ClockSolid($$renderer, { class: 'me-2 h-4 w-4' });
					$$renderer.push(`<!----> Set Time Schedule`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Drawer($$renderer, {
				class: 'w-96 bg-gray-50 p-6 dark:bg-gray-800',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Heading($$renderer, {
						tag: 'h5',
						id: 'drawer-label',
						class: 'mb-8 inline-flex items-center text-base font-semibold text-gray-800 uppercase dark:text-white',
						children: ($$renderer) => {
							ClockSolid($$renderer, { class: 'h-6 w-6' });
							$$renderer.push(`<!----> Time schedule`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <form class="space-y-8">`);

					Card($$renderer, {
						class: 'p-4 transition-shadow hover:shadow-lg',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex items-center justify-between"><div>`);

							Heading($$renderer, {
								tag: 'h6',
								class: 'text-lg font-semibold text-gray-900 dark:text-white',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Business Hours`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							P($$renderer, {
								class: 'text-sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Enable or disable business hours scheduling`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div> `);

							Toggle($$renderer, {
								class: 'scale-110',
								get checked() {
									return businessHoursEnabled;
								},

								set checked($$value) {
									businessHoursEnabled = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="space-y-2">`);

					Label($$renderer, {
						for: 'timezones',
						class: 'flex items-center gap-2 text-lg',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Timezone `);
							InfoCircleSolid($$renderer, { class: 'h-4 w-4 cursor-help text-gray-400' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Select($$renderer, {
						id: 'timezones',
						items: drawerTimezones,
						class: 'w-full',
						get value() {
							return selectedTimezoneDrawer;
						},

						set value($$value) {
							selectedTimezoneDrawer = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="space-y-2 sm:space-y-4"><!--[-->`);

					const each_array = $.ensure_array_like(sortedWorkingDays());

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						let { day, enabled, startTime, endTime } = each_array[index];

						$$renderer.push(`<div class="flex flex-col gap-2 rounded-lg bg-white p-2 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-700"><div class="flex min-w-[65px] items-center">`);

						Checkbox($$renderer, {
							onchange: () => toggleDay(index),
							checked: enabled,
							class: 'scale-100',
							children: ($$renderer) => {
								Span($$renderer, {
									class: 'ml-2 truncate text-sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(day)}`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="flex flex-1 items-center">`);

						Timepicker($$renderer, {
							type: 'range',
							value: startTime,
							endValue: endTime,
							onselect: (e) => handleTimeChange(index, true, e),
							divClass: timepickerClasses.divClass,
							inputClass: timepickerClasses.inputClass,
							size: 'sm'
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							color: 'red',
							size: 'xs',
							pill: true,
							onclick: () => removeInterval(index),
							class: 'shrink-0 p-2 hover:bg-red-600',
							children: ($$renderer) => {
								TrashBinSolid($$renderer, { class: 'h-2 w-2 sm:h-3 sm:w-3' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]--></div> `);

					Button($$renderer, {
						type: 'button',
						class: 'w-full transition-all hover:shadow-lg',
						color: 'alternative',
						onclick: addInterval,
						disabled: workingDays.length >= 7,
						children: ($$renderer) => {
							PlusOutline($$renderer, { class: 'me-2 h-5 w-5' });
							$$renderer.push(`<!----> Add Working Day`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="flex gap-4">`);

					Button($$renderer, {
						class: 'w-1/2',
						color: 'alternative',
						onclick: () => open = false,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Cancel`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						type: 'submit',
						class: 'w-1/2',
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Save Changes`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></form>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}