import * as $ from 'svelte/internal/server';
import { Button, DatePicker, DatePickerInput, Stack } from "carbon-components-svelte";

export default function DatePickerProgrammatic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let valueFrom = "01/01/2024";
		let valueTo = "01/31/2024";

		function advanceMonth(value) {
			var d = new Date(value);
			var month = d.getMonth() + 1;
			var year = d.getFullYear() + (month > 11 ? 1 : 0);

			month = month % 12;

			var lastDay = new Date(year, month + 1, 0).getDate();
			var day = Math.min(d.getDate(), lastDay);
			var mm = String(month + 1).padStart(2, "0");
			var dd = String(day).padStart(2, "0");

			return `${mm}/${dd}/${year}`;
		}

		function nextMonth() {
			valueFrom = advanceMonth(valueFrom);
			valueTo = advanceMonth(valueTo);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Stack($$renderer, {
				gap: 4,
				children: ($$renderer) => {
					DatePicker($$renderer, {
						datePickerType: 'range',
						get valueFrom() {
							return valueFrom;
						},

						set valueFrom($$value) {
							valueFrom = $$value;
							$$settled = false;
						},

						get valueTo() {
							return valueTo;
						},

						set valueTo($$value) {
							valueTo = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							DatePickerInput($$renderer, { labelText: 'Start date', placeholder: 'mm/dd/yyyy' });
							$$renderer.push(`<!----> `);
							DatePickerInput($$renderer, { labelText: 'End date', placeholder: 'mm/dd/yyyy' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Next month`);
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
	});
}