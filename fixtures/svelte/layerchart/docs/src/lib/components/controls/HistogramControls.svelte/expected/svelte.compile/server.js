import * as $ from 'svelte/internal/server';
import { NumberStepper, MenuField, RangeField } from 'svelte-ux';
import { timeDay, timeWeek, timeMonth } from 'd3-time';

import {
	randomNormal,
	randomUniform,
	randomInt,
	randomLogNormal,
	randomExponential,
	randomBates
} from 'd3-random';

import { cls } from '@layerstack/tailwind';

export default function HistogramControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			dateRange = void 0,
			thresholds = void 0,
			interval = void 0,
			random = void 0,
			selectedGenerator = void 0,
			randomCount = void 0
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (dateRange !== undefined || thresholds !== undefined || interval !== undefined) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cls('flex gap-2 mb-4 screenshot-hidden')))}>`);

				if (dateRange !== undefined) {
					$$renderer.push('<!--[0-->');

					NumberStepper($$renderer, {
						label: 'Date range',
						min: 1,
						class: 'w-40',
						get value() {
							return dateRange;
						},

						set value($$value) {
							dateRange = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (thresholds !== undefined) {
					$$renderer.push('<!--[0-->');

					RangeField($$renderer, {
						label: 'Thresholds',
						min: 0,
						max: 100,
						class: 'grow',
						get value() {
							return thresholds;
						},

						set value($$value) {
							thresholds = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (interval !== undefined) {
					$$renderer.push('<!--[0-->');

					MenuField($$renderer, {
						label: 'Interval',
						options: [
							{ label: 'Days', value: timeDay.range },
							{ label: 'Weeks', value: timeWeek.range },
							{ label: 'Months', value: timeMonth.range }
						],
						stepper: true,
						classes: { menuIcon: 'hidden' },
						get value() {
							return interval;
						},

						set value($$value) {
							interval = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (selectedGenerator !== undefined || randomCount !== undefined) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cls('grid grid-cols-[1fr_148px] gap-2 my-2 screenshot-hidden')))}>`);

				if (selectedGenerator !== undefined) {
					$$renderer.push('<!--[0-->');

					MenuField($$renderer, {
						label: 'Generator',
						options: [
							{ label: 'normal', value: 'normal' },
							{ label: 'uniform', value: 'uniform' },
							{ label: 'integer', value: 'integer' },
							{ label: 'logNormal', value: 'logNormal' },
							{ label: 'exponential', value: 'exponential' },
							{ label: 'bates', value: 'bates' }
						],

						get value() {
							return selectedGenerator;
						},

						set value($$value) {
							selectedGenerator = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (randomCount !== undefined) {
					$$renderer.push('<!--[0-->');

					NumberStepper($$renderer, {
						label: 'Count',
						class: 'w-full',
						get value() {
							return randomCount;
						},

						set value($$value) {
							randomCount = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		$.bind_props($$props, {
			dateRange,
			thresholds,
			interval,
			random,
			selectedGenerator,
			randomCount
		});
	});
}