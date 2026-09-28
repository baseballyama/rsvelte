import * as $ from 'svelte/internal/server';
import { Axis, Chart, Circle, FacetAxis, Grid, Rule, Svg } from 'layerchart';
import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Facet_composed($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');

		Chart($$renderer, {
			data,
			x: 'flipper_length_mm',
			y: 'body_mass_g',
			fx: 'species',
			xNice: true,
			yNice: true,
			padding: { left: 52, bottom: 32, top: 24, right: 8 },
			height: 300,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						FacetAxis($$renderer, {});
						$$renderer.push(`<!----> `);
						Grid($$renderer, { y: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left' });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom' });
						$$renderer.push(`<!----> `);
						Rule($$renderer, { y: 0 });
						$$renderer.push(`<!----> `);

						Circle($$renderer, {
							cx: 'flipper_length_mm',
							cy: 'body_mass_g',
							r: 2.5,
							fill: 'var(--color-secondary)',
							fillOpacity: 0.6
						});

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