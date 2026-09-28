import 'svelte/internal/disclose-version';
import { getUsCountiesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoLegend, GeoPath } from 'layerchart/geo';

const topology = await getUsCountiesTopology();
var root = $.from_html(`<!> <!>`, 1);

export default function Ticks($$anchor, $$props) {
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

				var node_1 = $.sibling(node, 2);

				GeoLegend(node_1, {
					units: 'mi',
					ticks: 1,
					placement: 'bottom-left',
					class: 'm-2'
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}