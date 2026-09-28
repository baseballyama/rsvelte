import * as $ from 'svelte/internal/server';
import { LineChart } from 'layerchart';

import {
	Button,
	ButtonGroup,
	Field,
	TextField,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import { format } from '@layerstack/utils';
import { AnimationFrames } from 'runed';

export default function Perf_streaming($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let motion = true;
		let show = true;
		let pointsPerFrame = 10;
		let maxLength = 1000;
		let chartData = [];

		function generateDataPoint(referenceDate, valueRange) {
			const value = Math.floor(Math.random() * (valueRange[1] - valueRange[0] + 1)) + valueRange[0];

			return {
				date: new Date(referenceDate),
				value: isFinite(value) ? value : valueRange[0]
			};
		}

		function generateDataPoints(count, startDate, dayIncrement, valueRange) {
			const points = [];

			for (let i = 0; i < count; i++) {
				const date = new Date(startDate.getTime() + i * dayIncrement * 24 * 60 * 60 * 1000);

				if (isNaN(date.getTime())) continue;

				points.push(generateDataPoint(date, valueRange));
			}

			return points;
		}

		const animation = new AnimationFrames(
			() => {
				// Get the latest date from the current data or use the last sample date
				const latestDate = chartData.length > 0
					? chartData[chartData.length - 1].date
					: new Date('2025-04-07T22:00:00.000Z');

				let nextDate = new Date(latestDate.getTime() + 24 * 60 * 60 * 1000); // Start from the next day
				const newPoints = generateDataPoints(pointsPerFrame, nextDate, 1, [0, 100]);

				// Check if we're at or over capacity
				if (chartData.length + newPoints.length > maxLength) {
					// Remove old points and add new points in one operation to maintain buffer size
					chartData = [
						...chartData.slice(-(maxLength - newPoints.length)),
						...newPoints
					];
				} else {
					// Just push new points
					chartData.push(...newPoints);
				}

				nextDate = new Date(nextDate.getTime() + pointsPerFrame * 24 * 60 * 60 * 1000);
			},
			{ fpsLimit: () => 30, immediate: false }
		);

		function loadRandomData() {
			const latestDate = chartData.length > 0
				? chartData[chartData.length - 1].date
				: new Date('2025-04-07T22:00:00.000Z');

			let nextDate = new Date(latestDate.getTime() + 24 * 60 * 60 * 1000); // Start from the next day
			const newPoints = generateDataPoints(pointsPerFrame, nextDate, 1, [0, 100]);

			// mutate in place
			chartData.splice(0, Math.max(0, chartData.length + newPoints.length - maxLength));

			chartData.push(...newPoints);
			chartData = chartData;
		}

		// Clear all data
		function clearData() {
			animation.stop();
			chartData = [];
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-4"><div class="flex gap-3">`);

			Field($$renderer, {
				label: 'Motion',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						get value() {
							return motion;
						},

						set value($$value) {
							motion = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Yes`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: false,
								children: ($$renderer) => {
									$$renderer.push(`<!---->No`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Show',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						get value() {
							return show;
						},

						set value($$value) {
							show = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Yes`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: false,
								children: ($$renderer) => {
									$$renderer.push(`<!---->No`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="m-2 flex items-end gap-2">`);

			ButtonGroup($$renderer, {
				_size: 'sm',
				variant: 'fill-light',
				children: ($$renderer) => {
					Button($$renderer, {
						onclick: () => animation.start(),
						disabled: animation.running,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Start`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						onclick: () => animation.stop(),
						disabled: !animation.running,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Stop`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: () => clearData(),
				variant: 'fill-light',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Clear`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: () => loadRandomData(),
				variant: 'fill-light',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Load more`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TextField($$renderer, {
				label: 'Frequency (Hz)',
				type: 'integer',
				min: 1,
				step: 100,
				dense: true,
				get value() {
					return pointsPerFrame;
				},

				set value($$value) {
					pointsPerFrame = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			TextField($$renderer, {
				label: 'Buffer size',
				type: 'integer',
				min: 1,
				step: 4000,
				dense: true,
				get value() {
					return maxLength;
				},

				set value($$value) {
					maxLength = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="h-[500px] p-4 border rounded-sm">`);

			if (show && chartData.length) {
				$$renderer.push('<!--[0-->');
				LineChart($$renderer, { x: 'date', y: 'value', data: chartData, brush: true });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> data: ${$.escape(format(chartData.length))} points</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}