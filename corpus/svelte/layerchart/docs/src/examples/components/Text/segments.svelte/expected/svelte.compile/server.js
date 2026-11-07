import * as $ from 'svelte/internal/server';
import { Chart, Layer, Text } from 'layerchart';

export default function Segments($$renderer) {
	Chart($$renderer, {
		height: 50,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Text($$renderer, {
						segments: [
							{
								value: 'Revenue',
								class: 'text-sm font-semibold text-primary'
							},

							{
								value: ' $1,200',
								class: 'text-xs font-light text-surface-content/75'
							}
						],
						x: 0,
						y: 20
					});

					$$renderer.push(`<!----> `);

					Text($$renderer, {
						segments: [
							{ value: 'Growth', class: 'text-sm font-semibold text-primary' },
							{ value: ' +12%', class: 'text-xs font-light text-success' }
						],
						x: 0,
						y: 50
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}