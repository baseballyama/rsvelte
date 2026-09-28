import * as $ from 'svelte/internal/server';
import { subDays } from 'date-fns';
import { mdiCalendarRange } from '@mdi/js';
import { DateRangeField } from 'svelte-ux';
import { PeriodType } from '@layerstack/utils';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let today = new Date();

		let value = {
			from: subDays(today, 3),
			to: today,
			periodType: PeriodType.Day
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRangeField($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Controlled</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRangeField($$renderer, {
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

			$$renderer.push(`<!----> <h2>Clearable</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRangeField($$renderer, {
						clearable: true,
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

			$$renderer.push(`<!----> <h2>PeriodType options</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRangeField($$renderer, {
						periodTypes: [PeriodType.Day, PeriodType.Month, PeriodType.CalendarYear],
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

			$$renderer.push(`<!----> <h2>Single PeriodType options with presets</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRangeField($$renderer, {
						periodTypes: [PeriodType.Day],
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

			$$renderer.push(`<!----> <h2>Single PeriodType options without presets</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRangeField($$renderer, {
						periodTypes: [PeriodType.Day],
						getPeriodTypePresets: () => [],
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
					DateRangeField($$renderer, {
						icon: mdiCalendarRange,
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

			$$renderer.push(`<!----> <h2>Stepper</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRangeField($$renderer, {
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

			$$renderer.push(`<!----> <h2>Stepper w/ icon</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRangeField($$renderer, {
						stepper: true,
						icon: mdiCalendarRange,
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

			$$renderer.push(`<!----> <h2>Stepper w/ rounded &amp; centered</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRangeField($$renderer, {
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