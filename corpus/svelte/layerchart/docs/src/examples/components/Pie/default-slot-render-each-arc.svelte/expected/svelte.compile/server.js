import * as $ from 'svelte/internal/server';
import { Arc, Chart, Layer, Pie } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Default_slot_render_each_arc($$renderer, $$props) {
	// fixed data (same as disable-sorting example to call attention to what sorting does)
	const data = [
		{ date: '2025-11-04T05:00:00.000Z', value: 99 },
		{ date: '2025-11-05T05:00:00.000Z', value: 84 },
		{ date: '2025-11-06T05:00:00.000Z', value: 90 },
		{ date: '2025-11-07T05:00:00.000Z', value: 67 }
	];

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	Chart($$renderer, {
		data,
		x: 'value',
		c: 'date',
		cRange: keyColors,
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

								Arc($$renderer, {
									startAngle: arc.startAngle,
									endAngle: arc.endAngle,
									padAngle: arc.padAngle,
									fill: keyColors[index],
									offset: index === 0 ? 16 : 0
								});
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
}