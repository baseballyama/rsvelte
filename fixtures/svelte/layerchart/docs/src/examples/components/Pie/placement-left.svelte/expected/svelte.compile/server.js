import * as $ from 'svelte/internal/server';
import { Chart, Group, Layer, Pie } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Placement_left($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

		const keyColors = [
			'var(--color-info)',
			'var(--color-success)',
			'var(--color-warning)',
			'var(--color-danger)'
		];

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Group($$renderer, {
							x: context.height / 2,
							center: 'y',
							children: ($$renderer) => {
								Pie($$renderer, {});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				data,
				x: 'value',
				c: 'date',
				cRange: keyColors,
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}