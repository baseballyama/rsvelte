import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Circle, FacetAxis, Grid, Rule, Svg } from 'layerchart';

const penguins = await getPenguins();
var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Facet_composed($$anchor, $$props) {
	$.push($$props, true);

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'flipper_length_mm',
		y: 'body_mass_g',
		fx: 'species',
		xNice: true,
		yNice: true,
		padding: { left: 52, bottom: 32, top: 24, right: 8 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					FacetAxis(node, {});

					var node_1 = $.sibling(node, 2);

					Grid(node_1, { y: true });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'left' });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'bottom' });

					var node_4 = $.sibling(node_3, 2);

					Rule(node_4, { y: 0 });

					var node_5 = $.sibling(node_4, 2);

					Circle(node_5, {
						cx: 'flipper_length_mm',
						cy: 'body_mass_g',
						r: 2.5,
						fill: 'var(--color-secondary)',
						fillOpacity: 0.6
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}