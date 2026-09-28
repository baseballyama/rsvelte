import * as $ from 'svelte/internal/server';
import { mdiCalendar } from '@mdi/js';
import { Button, DatePickerField } from 'svelte-ux';
import { PeriodType } from '@layerstack/utils';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = new Date();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Controlled</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, {
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

			$$renderer.push(`<!----> <h2>Icon</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, {
						icon: mdiCalendar,
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

			$$renderer.push(`<!----> <h2>Label</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, {
						label: 'Date of Birth',
						icon: mdiCalendar,
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

			$$renderer.push(`<!----> <h2>Stepper w/ default (day)</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, {
						stepper: true,
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

			$$renderer.push(`<!----> <h2>Stepper w/ month</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, {
						periodType: PeriodType.Month,
						stepper: true,
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

			$$renderer.push(`<!----> <h2>Stepper w/ rounded</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, {
						stepper: true,
						rounded: true,
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

			$$renderer.push(`<!----> <h2>Stepper w/ rounded &amp; center</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, {
						stepper: true,
						rounded: true,
						center: true,
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

			$$renderer.push(`<!----> <h2>Icon only</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, { iconOnly: true });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Label only</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, { label: 'Start Date' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Clearable</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DatePickerField($$renderer, { label: 'Start Date', clearable: true });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>within form</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<form>`);
					DatePickerField($$renderer, { label: 'Start Date', name: 'start_date', clearable: true });
					$$renderer.push(`<!----> `);

					Button($$renderer, {
						type: 'submit',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Submit`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></form>`);
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