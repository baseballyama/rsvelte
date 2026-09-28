import * as $ from 'svelte/internal/server';
import { Chart, Legend } from 'layerchart';
import { scaleOrdinal } from 'd3-scale';

export default function Chart_integration($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			data: [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }],
			c: 'name',
			cScale: scaleOrdinal(),
			cRange: [
				'var(--color-success)',
				'var(--color-warning)',
				'var(--color-danger)'
			],
			height: 40,
			children: ($$renderer) => {
				Legend($$renderer, { title: 'I am Legend' });
			},
			$$slots: { default: true }
		});
	});
}