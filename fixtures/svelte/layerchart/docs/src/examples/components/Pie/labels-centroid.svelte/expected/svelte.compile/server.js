import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { Arc, Chart, Layer, Pie, Text } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Labels_centroid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

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
											Text($$renderer, $.spread_props([
												{ value: arc.data.value },
												getArcTextProps('centroid'),
												{ class: cls('text-sm ', colors.content) }
											]));
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