import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Transform_globe_constrain($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);
	const data = { topology, countries };
	var $$exports = { data };

	{
		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: countries }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},

			transform: {
				mode: 'projection',
				constrain: ({ scale, translate }) => ({
					scale,
					translate: { x: translate.x, y: Math.max(-90, Math.min(90, translate.y)) }
				})
			},
			padding: { top: 5, bottom: 5, left: 5, right: 5 },
			height: 400,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						GeoPath(node, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/20' });

						var node_1 = $.sibling(node, 2);

						Graticule(node_1, { class: 'stroke-surface-content/20' });

						var node_2 = $.sibling(node_1, 2);

						$.each(node_2, 17, () => countries.features, $.index, ($$anchor, feature, $$index, $$array) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'stroke-surface-100/30 fill-surface-content/70'
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}