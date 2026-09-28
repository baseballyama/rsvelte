import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Circle } from 'layerchart';

const penguins = await getPenguins();

export default function Facet_y($$anchor, $$props) {
	$.push($$props, true);

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	var $$exports = { data };

	{
		const marks = ($$anchor) => {
			Circle($$anchor, {
				cx: 'flipper_length_mm',
				cy: 'body_mass_g',
				r: 2.5,
				fill: 'var(--color-primary)',
				fillOpacity: 0.6
			});
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'flipper_length_mm',
			y: 'body_mass_g',
			fy: 'species',
			xNice: true,
			yNice: true,
			padding: { left: 52, bottom: 32, top: 8, right: 72 },
			height: 420,
			marks,
			$$slots: { marks: true }
		});
	}

	return $.pop($$exports);
}