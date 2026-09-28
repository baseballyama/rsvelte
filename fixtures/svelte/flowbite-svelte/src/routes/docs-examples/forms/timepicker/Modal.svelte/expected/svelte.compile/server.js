import * as $ from 'svelte/internal/server';
import { Button, Modal, Label, Datepicker, Timepicker, Heading, P } from "flowbite-svelte";
import { ClockSolid } from "flowbite-svelte-icons";

export default function Modal_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let modalSelectedDate = new Date();
		let modalTimeSelection = { time: "10:00", endTime: "11:00" };

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

		function handleModalDateSelect(selectedDate) {
			if (selectedDate instanceof Date) {
				modalSelectedDate = selectedDate;
			} else if (selectedDate && typeof selectedDate === "object") {
				// Handle range case if needed
				if (selectedDate.from) {
					modalSelectedDate = selectedDate.from;
				}
			}
		}

		function handleModalTimeSelect(data) {
			if (data) {
				modalTimeSelection = { time: data.time, endTime: data.endTime };
			}
		}

		function handleSave() {
			open = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, {
				onclick: () => open = true,
				children: ($$renderer) => {
					ClockSolid($$renderer, { class: 'me-2 h-4 w-4' });
					$$renderer.push(`<!----> Schedule appointment`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (modalTimeSelection) {
				$$renderer.push('<!--[0-->');

				P($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Appointment scheduled for ${$.escape(modalSelectedDate.toDateString())} at ${$.escape(modalTimeSelection.time)}`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			{
				function header($$renderer) {
					Heading($$renderer, {
						tag: 'h5',
						class: 'mb-4 font-medium text-gray-900 dark:text-white',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Schedule an appointment`);
						},
						$$slots: { default: true }
					});
				}

				Modal($$renderer, {
					class: 'w-full max-w-[23rem]',
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},
					header,
					children: ($$renderer) => {
						$$renderer.push(`<div class="p-4 sm:p-5"><div class="mb-4">`);

						Datepicker($$renderer, {
							onselect: handleModalDateSelect,
							inline: true,
							class: 'mx-auto [&_div>button]:bg-gray-50 [&>div>div]:bg-gray-50 [&>div>div]:shadow-none',
							get value() {
								return modalSelectedDate;
							},

							set value($$value) {
								modalSelectedDate = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div> <div class="mb-4">`);

						Label($$renderer, {
							class: 'mb-2 block',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Pick your time`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Timepicker($$renderer, {
							type: 'inline-buttons',
							value: modalTimeSelection.time,
							timeIntervals,
							onselect: handleModalTimeSelect,
							columns: 3
						});

						$$renderer.push(`<!----></div> <div class="flex items-center space-x-4">`);

						Button($$renderer, {
							color: 'primary',
							class: 'w-full',
							onclick: handleSave,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Save`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							color: 'alternative',
							class: 'w-full',
							onclick: () => open = false,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Discard`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div>`);
					},
					$$slots: { header: true, default: true }
				});
			}

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