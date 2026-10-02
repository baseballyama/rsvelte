import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, GeoRaster, Graticule } from 'layerchart/geo';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Globe($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);

	// NASA Blue Marble — equirectangular / plate carrée. Served locally from
	// `static/images/` to avoid CORS issues when reading pixel data.
	const imageUrl = '/images/blue-marble.jpg';

	const data = { topology, countries };
	var $$exports = { data };

	{
		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: { type: 'Sphere' } }));

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
			height: 500,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				Layer(node, {
					type: 'canvas',
					children: ($$anchor, $$slotProps) => {
						GeoRaster($$anchor, { image: imageUrl, interpolate: 'bilinear' });
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				Layer(node_1, {
					type: 'svg',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_2 = $.first_child(fragment_3);

						GeoPath(node_2, {
							geojson: { type: 'Sphere' },
							class: 'fill-none stroke-surface-content/40'
						});

						var node_3 = $.sibling(node_2, 2);

						Graticule(node_3, { class: 'stroke-surface-content/15' });

						var node_4 = $.sibling(node_3, 2);

						$.each(node_4, 17, () => countries.features, $.index, ($$anchor, feature, $$index, $$array) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'fill-none stroke-surface-content/40'
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}