import 'svelte/internal/disclose-version';
import { getWorldLinks, getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoEdgeFade, GeoPath, GeoPoint, GeoSpline, Graticule } from 'layerchart/geo';

const topology = await getCountriesTopology();
const worldLinks = await getWorldLinks();
var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Draggable_globe($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);
	const data = { countries, worldLinks };
	var $$exports = { data };

	{
		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: countries }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},
			transform: { mode: 'projection' },
			padding: { top: 80, bottom: 80, left: 80, right: 80 },
			height: 800,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						GeoPath(node, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/50' });

						var node_1 = $.sibling(node, 2);

						Graticule(node_1, { class: 'stroke-surface-content/20 pointer-events-none' });

						var node_2 = $.sibling(node_1, 2);

						$.each(node_2, 17, () => countries.features, $.index, ($$anchor, country) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(country);
								},
								class: 'stroke-surface-content/50 fill-white pointer-events-none'
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.each(node_3, 17, () => worldLinks, $.index, ($$anchor, link) => {
							GeoEdgeFade($$anchor, {
								get link() {
									return $.get(link);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_4 = $.first_child(fragment_5);

									GeoPoint(node_4, {
										get lat() {
											return $.get(link).source[1];
										},

										get long() {
											return $.get(link).source[0];
										},
										r: 2,
										class: 'fill-black'
									});

									var node_5 = $.sibling(node_4, 2);

									GeoPoint(node_5, {
										get lat() {
											return $.get(link).target[1];
										},

										get long() {
											return $.get(link).target[0];
										},
										r: 2,
										class: 'fill-black'
									});

									var node_6 = $.sibling(node_5, 2);

									GeoSpline(node_6, {
										get link() {
											return $.get(link);
										},
										class: 'stroke-gray-500/30 stroke-2'
									});

									var node_7 = $.sibling(node_6, 2);

									GeoSpline(node_7, {
										get link() {
											return $.get(link);
										},
										class: 'stroke-danger stroke-2',
										loft: 1.3
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
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