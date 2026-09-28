import * as $ from 'svelte/internal/server';
import { Chart, Circle, Frame } from 'layerchart';
import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Facet_two_dimensional($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Rows missing a measurement are dropped, but a missing `sex` is kept — it becomes the
		// rightmost column
		const data = penguins.filter((d) => d.bill_length_mm !== 'NA' && d.bill_depth_mm !== 'NA');

		{
			function marks($$renderer) {
				Frame($$renderer, { class: 'stroke-surface-content/20 fill-none' });
				$$renderer.push(`<!----> `);

				Circle($$renderer, {
					cx: 'bill_length_mm',
					cy: 'bill_depth_mm',
					r: 2.5,
					fill: 'var(--color-primary)',
					fillOpacity: 0.7
				});

				$$renderer.push(`<!---->`);
			}

			Chart($$renderer, {
				data,
				x: 'bill_length_mm',
				y: 'bill_depth_mm',
				fx: 'sex',
				fy: 'species',
				fxDomain: ['female', 'male', 'NA'],
				xNice: true,
				yNice: true,
				grid: true,
				padding: { left: 44, bottom: 32, top: 24, right: 72 },
				height: 480,
				marks,
				$$slots: { marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}