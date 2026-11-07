import 'svelte/internal/disclose-version';
import { getUsCountiesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoLegend, GeoPath } from 'layerchart/geo';

const topology = await getUsCountiesTopology();
var root = $.from_html(`<!> <div class="absolute bottom-0 left-0 m-2 flex flex-col"><!> <!></div>`, 1);

export default function Stacked_units($$anchor, $$props) {
	$.push($$props, true);

	const states = feature(topology, topology.objects.states);

	{
		let $0 = $.derived(() => ({ projection: geoAlbersUsa, fitGeojson: states }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},
			transform: { mode: 'projection', scrollMode: 'scale' },
			padding: { bottom: 80 },
			height: 500,
			clip: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				Layer(node, {
					children: ($$anchor, $$slotProps) => {
						GeoPath($$anchor, {
							get geojson() {
								return states;
							},
							class: 'fill-surface-100 stroke-surface-content'
						});
					},
					$$slots: { default: true }
				});

				var div = $.sibling(node, 2);
				var node_1 = $.child(div);

				GeoLegend(node_1, { units: 'km', labelPlacement: 'top' });

				var node_2 = $.sibling(node_1, 2);

				GeoLegend(node_2, { units: 'mi' });
				$.reset(div);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}