import 'svelte/internal/disclose-version';
import { getUsCountiesTopology } from '$lib/geo.remote';
import * as $ from 'svelte/internal/client';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoLegend, GeoPath } from 'layerchart/geo';

const topology = await getUsCountiesTopology();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><div class="text-sm font-semibold mb-1"> </div> <!></div>`);
var root_2 = $.from_html(`<div class="grid gap-6"></div>`);

export default function Variants($$anchor, $$props) {
	$.push($$props, true);

	const states = feature(topology, topology.objects.states);
	var div = root_2();

	$.each(div, 20, () => ['bracket', 'alternating'], $.index, ($$anchor, variant) => {
		var div_1 = root_1();
		var div_2 = $.child(div_1);
		var text = $.only_child(div_2, true);
		var node = $.sibling(div_2, 2);

		{
			let $0 = $.derived(() => ({ projection: geoAlbersUsa, fitGeojson: states }));

			Chart(node, {
				get geo() {
					return $.get($0);
				},
				height: 300,
				padding: { bottom: 60 },
				children: ($$anchor, $$slotProps) => {
					var fragment = root();
					var node_1 = $.first_child(fragment);

					Layer(node_1, {
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

					var node_2 = $.sibling(node_1, 2);

					GeoLegend(node_2, {
						get variant() {
							return variant;
						},
						units: 'mi',
						placement: 'bottom-left',
						class: 'm-2'
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});
		}

		$.reset(div_1);
		$.template_effect(() => $.set_text(text, variant));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}