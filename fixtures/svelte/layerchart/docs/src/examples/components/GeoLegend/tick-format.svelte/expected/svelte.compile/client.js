import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoNaturalEarth1 } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoLegend, GeoPath } from 'layerchart/geo';

const topology = await getCountriesTopology();
var root = $.from_html(`<!> <!>`, 1);

export default function Tick_format($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);

	{
		let $0 = $.derived(() => ({ projection: geoNaturalEarth1, fitGeojson: countries }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},
			transform: { mode: 'projection', scrollMode: 'scale' },
			padding: { bottom: 60 },
			height: 500,
			clip: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				Layer(node, {
					children: ($$anchor, $$slotProps) => {
						GeoPath($$anchor, {
							get geojson() {
								return countries;
							},
							class: 'fill-surface-100 stroke-surface-content'
						});
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				GeoLegend(node_1, {
					units: 'km',
					tickFormat: 'metric',
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