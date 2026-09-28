import * as $ from 'svelte/internal/server';
import { Axis, Chart, Density, Layer, Points } from 'layerchart';
import { getFaithful } from '$lib/data.remote.js';

const data = await getFaithful();

export default function Stroke_only($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			data,
			x: 'eruptions',
			y: 'waiting',
			xDomain: [1, 6],
			yDomain: [40, 100],
			xNice: true,
			yNice: true,
			padding: { left: 30, bottom: 24, top: 8, right: 8 },
			height: 400,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						Density($$renderer, {
							fill: 'none',
							stroke: 'oklch(0.6 0.2 260)',
							strokeWidth: 1,
							bandwidth: 10,
							thresholds: 20
						});

						$$renderer.push(`<!----> `);
						Points($$renderer, { r: 1.5, class: 'fill-surface-content/50' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}