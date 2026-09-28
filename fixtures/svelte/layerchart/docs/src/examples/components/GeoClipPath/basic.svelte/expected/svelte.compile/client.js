import 'svelte/internal/disclose-version';
import { getUsStatesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Rect } from 'layerchart';
import { GeoClipPath, GeoPath, Graticule } from 'layerchart/geo';

const topology = await getUsStatesTopology();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	const nation = feature(topology, topology.objects.nation);
	const states = feature(topology, topology.objects.states);

	{
		let $0 = $.derived(() => ({ projection: geoAlbersUsa, fitGeojson: states }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},
			height: 400,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						GeoClipPath(node, {
							get geojson() {
								return nation;
							},
							invert: true,
							children: ($$anchor, $$slotProps) => {
								Graticule($$anchor, { class: 'stroke-primary/30' });
							},
							$$slots: { default: true }
						});

						var node_1 = $.sibling(node, 2);

						$.each(node_1, 17, () => states.features, (feature) => feature.id, ($$anchor, feature, $$index, $$array) => {
							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},
								class: 'fill-none stroke-surface-content/20'
							});
						});

						var node_2 = $.sibling(node_1, 2);

						GeoPath(node_2, {
							get geojson() {
								return nation;
							},
							class: 'fill-none stroke-surface-content'
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}