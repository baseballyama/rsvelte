import 'svelte/internal/disclose-version';
import { getWorldLinks, getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoNaturalEarth1 } from 'd3-geo';
import { flatRollup } from 'd3-array';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, GeoPoint, GeoSpline, Graticule } from 'layerchart/geo';

const topology = await getCountriesTopology();
const worldLinks = await getWorldLinks();
var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function World_map($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);

	// Use a single link per source
	const singleLinks = flatRollup(
		worldLinks,
		(values) => {
			return values[1];
		},
		(d) => d.sourceId
	).map((d) => d[1]);

	const data = { countries, singleLinks };
	var $$exports = { data };

	{
		let $0 = $.derived(() => ({ projection: geoNaturalEarth1, fitGeojson: countries }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},
			padding: { top: 16, bottom: 16, left: 16, right: 16 },
			height: 600,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						GeoPath(node, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/50' });

						var node_1 = $.sibling(node, 2);

						Graticule(node_1, { class: 'stroke-surface-content/20' });

						var node_2 = $.sibling(node_1, 2);

						$.each(node_2, 17, () => countries.features, $.index, ($$anchor, country) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(country);
								},
								class: 'stroke-surface-content/50 fill-white'
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.each(node_3, 17, () => singleLinks, $.index, ($$anchor, link) => {
							var fragment_4 = root();
							var node_4 = $.first_child(fragment_4);

							GeoSpline(node_4, {
								get link() {
									return $.get(link);
								},
								class: 'stroke-gray-500/30 stroke-2'
							});

							var node_5 = $.sibling(node_4, 2);

							GeoSpline(node_5, {
								get link() {
									return $.get(link);
								},
								class: 'stroke-danger stroke-2',
								loft: 1.3
							});

							var node_6 = $.sibling(node_5, 2);

							GeoPoint(node_6, {
								get lat() {
									return $.get(link).source[1];
								},

								get long() {
									return $.get(link).source[0];
								},
								r: 2,
								class: 'fill-black'
							});

							var node_7 = $.sibling(node_6, 2);

							GeoPoint(node_7, {
								get lat() {
									return $.get(link).target[1];
								},

								get long() {
									return $.get(link).target[0];
								},
								r: 2,
								class: 'fill-black'
							});

							$.append($$anchor, fragment_4);
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