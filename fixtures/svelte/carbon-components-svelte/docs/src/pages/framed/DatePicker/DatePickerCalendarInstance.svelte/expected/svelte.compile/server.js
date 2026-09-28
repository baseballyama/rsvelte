import * as $ from 'svelte/internal/server';
import { Button, DatePicker, DatePickerInput, Stack } from "carbon-components-svelte";

export default function DatePickerCalendarInstance($$renderer) {
	let calendar = null;
	let weekendsDisabled = false;

	function openCalendar(e) {
		// Prevent the click from bubbling to the outside click
		// handler and closing the calendar immediately.
		e.stopPropagation();

		calendar?.open();
	}

	function toggleWeekends() {
		weekendsDisabled = !weekendsDisabled;

		calendar?.set("disable", weekendsDisabled
			? [(date) => date.getDay() === 0 || date.getDay() === 6]
			: []);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 4,
			children: ($$renderer) => {
				DatePicker($$renderer, {
					datePickerType: 'single',
					get calendar() {
						return calendar;
					},

					set calendar($$value) {
						calendar = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						DatePickerInput($$renderer, { labelText: 'Appointment', placeholder: 'mm/dd/yyyy' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Stack($$renderer, {
					gap: 3,
					orientation: 'horizontal',
					children: ($$renderer) => {
						Button($$renderer, {
							kind: 'tertiary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open calendar`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							kind: 'tertiary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(weekendsDisabled ? "Enable" : "Disable")}
      weekends`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
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
}