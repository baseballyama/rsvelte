import 'svelte/internal/disclose-version';
import { getUsStatesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Text } from 'layerchart';
import { GeoPath } from 'layerchart/geo';

const topology = await getUsStatesTopology();
var root = $.from_svg(`<g class="states"></g><g class="labels pointer-events-none"></g>`, 1);

export default function Us_country_map($$anchor, $$props) {
	$.push($$props, true);

	const states = feature(topology, topology.objects.states);
	const data = { topology, states };
	var $$exports = { data };

	{
		let $0 = $.derived(() => ({ projection: geoAlbersUsa, fitGeojson: states }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},
			height: 600,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var g = $.first_child(fragment_2);

						$.each(g, 21, () => states.features, $.index, ($$anchor, feature, $$index, $$array) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20'
							});
						});

						$.reset(g);

						var g_1 = $.sibling(g);

						$.each(g_1, 21, () => states.features, $.index, ($$anchor, feature, $$index_1, $$array_1) => {
							{
								const children = ($$anchor, $$arg0) => {
									let geoPath = () => ($$arg0?.()).geoPath;

									const computed_const = $.derived(() => {
										const [x, y] = geoPath()?.centroid($.get(feature)) ?? [];

										return { x, y };
									});
								};

								GeoPath($$anchor, {
									get geojson() {
										return $.get(feature);
									},
									children,
									$$slots: { default: true }
								});
							}
						});

						$.reset(g_1);
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