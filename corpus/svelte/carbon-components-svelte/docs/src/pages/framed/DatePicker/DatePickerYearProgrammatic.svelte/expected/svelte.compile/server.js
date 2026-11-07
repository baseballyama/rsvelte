import * as $ from 'svelte/internal/server';
import { Button, DatePicker, DatePickerInput, Stack } from "carbon-components-svelte";

export default function DatePickerYearProgrammatic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "";
		let calendar = null;

		function selectCurrentYear() {
			value = String(new Date().getFullYear());
		}

		function viewNextDecade() {
			calendar?.changeYear(calendar.currentYear + 10);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Stack($$renderer, {
				gap: 4,
				children: ($$renderer) => {
					DatePicker($$renderer, {
						datePickerType: 'year',
						dateFormat: 'Y',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						get calendar() {
							return calendar;
						},

						set calendar($$value) {
							calendar = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							DatePickerInput($$renderer, { labelText: 'Fiscal year', placeholder: 'yyyy' });
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
									$$renderer.push(`<!---->Select current year`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								kind: 'tertiary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->View next decade`);
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
	});
}