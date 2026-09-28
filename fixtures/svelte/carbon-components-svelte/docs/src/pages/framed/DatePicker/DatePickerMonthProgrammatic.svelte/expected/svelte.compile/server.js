import * as $ from 'svelte/internal/server';
import { Button, DatePicker, DatePickerInput, Stack } from "carbon-components-svelte";

export default function DatePickerMonthProgrammatic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "03/2026";

		function previousMonth() {
			var [month, year] = value.split("/").map(Number);
			var d = new Date(year, month - 2, 1);
			var mm = String(d.getMonth() + 1).padStart(2, "0");

			value = `${mm}/${d.getFullYear()}`;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Stack($$renderer, {
				gap: 4,
				children: ($$renderer) => {
					DatePicker($$renderer, {
						datePickerType: 'month',
						dateFormat: 'm/Y',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							DatePickerInput($$renderer, { labelText: 'Billing month', placeholder: 'mm/yyyy' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Previous month`);
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