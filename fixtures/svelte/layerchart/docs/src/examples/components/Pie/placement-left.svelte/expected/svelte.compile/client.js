import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Group, Layer, Pie } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Placement_left($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => context().height / 2);

						Group($$anchor, {
							get x() {
								return $.get($0);
							},
							center: 'y',
							children: ($$anchor, $$slotProps) => {
								Pie($$anchor, {});
							},
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'value',
			c: 'date',
			get cRange() {
				return keyColors;
			},
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}