import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Spline, Trail } from 'layerchart';
import { getTdfStage } from '$lib/data.remote';

const data = await getTdfStage();

export const title = 'Tour de France Stage Profile';
export const description = 'Elevation profile of a Tour de France stage using trail width to encode elevation.';

export default function Tdf_stage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			data,
			x: 'long',
			y: 'lat',
			r: 'elev',
			rRange: [1, 20],
			padding: { left: 50, bottom: 30 },
			height: 500,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, label: 'Latitude' });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', label: 'Longitude' });
						$$renderer.push(`<!----> `);
						Trail($$renderer, { class: 'fill-danger/40' });
						$$renderer.push(`<!----> `);
						Spline($$renderer, { class: 'stroke-1 stroke-surface-content' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}