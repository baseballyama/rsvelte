import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Group, Layer, Text } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import { curveBasis } from 'd3-shape';
import { max } from 'd3-array';
import { Field, RangeField, Switch } from 'svelte-ux';
import { createDateSeries } from '$lib/utils/data.js';

export default function Ridgeline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let overlap = 2;
		let height = 400;
		let opaque = false;
		const N = 10; // number of categories
		const basePadding = { top: 20, bottom: 30, left: 80, right: 10 };

		// Solve for top padding that fits the tallest peaks:
		// peaks extend (overlap-1)*step above the first row, and step depends on innerHeight
		const overlapExtra = $.derived(() => Math.max(0, overlap - 1));

		const paddingTop = $.derived(() => (N * basePadding.top + overlapExtra() * (height - basePadding.bottom)) / (N + overlapExtra()));
		const padding = $.derived(() => ({ ...basePadding, top: paddingTop() }));

		const categories = [
			'Series A',
			'Series B',
			'Series C',
			'Series D',
			'Series E',
			'Series F',
			'Series G',
			'Series H',
			'Series I',
			'Series J'
		];

		const seriesData = categories.map((name) => ({
			name,
			values: createDateSeries({ count: 40, min: 0, max: 100, value: 'integer' })
		}));

		const maxValue = max(seriesData.flatMap((s) => s.values.map((d) => d.value))) ?? 100;

		// Inner chart height (total minus padding) used to make yScale an identity
		const innerHeight = $.derived(() => height - paddingTop() - basePadding.bottom);

		const step = $.derived(() => innerHeight() / N);

		// Value scale converts data values to pixel offsets within each row (negative = upward)
		const zScale = $.derived(() => scaleLinear().domain([0, maxValue]).range([0, -overlap * step()]));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex gap-4 mb-4">`);

			RangeField($$renderer, {
				label: 'Overlap',
				min: 1,
				max: 12,
				step: 0.5,
				get value() {
					return overlap;
				},

				set value($$value) {
					overlap = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Height',
				min: 200,
				max: 600,
				step: 50,
				get value() {
					return height;
				},

				set value($$value) {
					height = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Opaque',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return opaque;
							},

							set checked($$value) {
								opaque = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				data: seriesData[0].values,
				x: 'date',
				y: 'value',
				yDomain: [0, innerHeight()],
				yRange: ({ height }) => [0, height],
				padding: padding(),
				height,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(seriesData);

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let series = each_array[i];
								const rowY = step() + i * step();

								Group($$renderer, {
									y: rowY,
									children: ($$renderer) => {
										Area($$renderer, {
											data: series.values,
											y0: () => 0,
											y1: (d) => zScale()(d.value),
											curve: curveBasis,
											class: opaque
												? 'fill-primary-200 dark:fill-primary-900'
												: 'fill-primary/20',
											line: { class: 'stroke-primary stroke-1' }
										});
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]--> <!--[-->`);

							const each_array_1 = $.ensure_array_like(categories);

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let name = each_array_1[i];
								const rowY = step() + i * step();

								Text($$renderer, {
									value: name,
									x: -8,
									y: rowY,
									textAnchor: 'end',
									verticalAnchor: 'middle',
									class: 'text-xs fill-surface-content/60'
								});
							}

							$$renderer.push(`<!--]--> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
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
		$.bind_props($$props, { data: seriesData });
	});
}