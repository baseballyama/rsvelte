import * as $ from 'svelte/internal/server';
import { sum } from 'd3-array';
import { cls } from '@layerstack/tailwind';
import { format } from '@layerstack/utils';
import { Arc, Chart, Layer, Pie, Text } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Labels_centroid_multiple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
		const dataSum = $.derived(() => sum(data, (d) => d.value));

		const keyClasses = [
			{ shape: 'fill-info', content: 'fill-info-content' },
			{ shape: 'fill-success', content: 'fill-success-content' },
			{ shape: 'fill-warning', content: 'fill-warning-content' },
			{ shape: 'fill-danger', content: 'fill-danger-content' }
		];

		Chart($$renderer, {
			data,
			x: 'value',
			c: 'date',
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						{
							function children($$renderer, { arcs }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(arcs);

								for (let index = 0, $$length = each_array.length; index < $$length; index++) {
									let arc = each_array[index];
									const colors = keyClasses[index];

									{
										function children($$renderer, { getArcTextProps }) {
											const textProps = getArcTextProps('centroid');

											Text($$renderer, $.spread_props([
												{ value: format(arc.data.value / dataSum(), 'percent') },
												textProps,
												{ dy: -8, class: cls('text-base', colors.content) }
											]));

											$$renderer.push(`<!----> `);

											Text($$renderer, $.spread_props([
												{ value: arc.data.value },
												textProps,
												{ dy: 8, class: cls('text-sm opacity-50', colors.content) }
											]));

											$$renderer.push(`<!---->`);
										}

										Arc($$renderer, {
											startAngle: arc.startAngle,
											endAngle: arc.endAngle,
											padAngle: arc.padAngle,
											class: colors.shape,
											children,
											$$slots: { default: true }
										});
									}
								}

								$$renderer.push(`<!--]-->`);
							}

							Pie($$renderer, { children, $$slots: { default: true } });
						}
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}