import * as $ from 'svelte/internal/server';
import { Chart, Circle } from 'layerchart';
import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Facet_brush_zoom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');

		{
			function marks($$renderer) {
				Circle($$renderer, {
					cx: 'flipper_length_mm',
					cy: 'body_mass_g',
					r: 2.5,
					fill: 'var(--color-primary)',
					fillOpacity: 0.6,
					motion: 'tween'
				});
			}

			Chart($$renderer, {
				data,
				x: 'flipper_length_mm',
				y: 'body_mass_g',
				fx: 'species',
				xNice: true,
				yNice: true,
				grid: true,
				brush: { axis: 'both', zoomOnBrush: true },
				props: { xAxis: { motion: 'tween' }, yAxis: { motion: 'tween' } },
				padding: { left: 52, bottom: 32, top: 24, right: 8 },
				height: 300,
				marks,
				$$slots: { marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}