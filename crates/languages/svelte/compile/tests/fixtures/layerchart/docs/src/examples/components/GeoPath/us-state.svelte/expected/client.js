import 'svelte/internal/disclose-version';
import { getUsCountiesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import GeopathControls from '$lib/components/controls/GeoPathStatesControls.svelte';
import { sort } from '@layerstack/utils';

const topology = await getUsCountiesTopology();
var root = $.from_html(`<!> <!>`, 1);

export default function Us_state($$anchor, $$props) {
	$.push($$props, true);

	const states = feature(topology, topology.objects.states);
	const stateOptions = sort(states.features.filter((x) => Number(x.id) < 60).map((x) => ({ label: x.properties.name, value: x.id })), (d) => d.value);
	let selectedStateId = $.state('54' // 'West Virginia';
	);
	const selectedStateFeature = $.derived(() => states.features.find((f) => f.id === $.get(selectedStateId)));
	let projection = $.state($.proxy(geoAlbersUsa));

	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Mercator', value: geoMercator }
	];

	const data = {
		topology,
		states,
		selectedStateFeature: $.get(selectedStateFeature)
	};

	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	GeopathControls(node, {
		get stateOptions() {
			return stateOptions;
		},

		get projections() {
			return projections;
		},

		get selectedStateId() {
			return $.get(selectedStateId);
		},

		set selectedStateId($$value) {
			$.set(selectedStateId, $$value, true);
		},

		get projection() {
			return $.get(projection);
		},

		set projection($$value) {
			$.set(projection, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({
			projection: $.get(projection),
			fitGeojson: $.get(selectedStateFeature)
		}));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},
			height: 600,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						GeoPath($$anchor, {
							get geojson() {
								return $.get(selectedStateFeature);
							},
							class: 'stroke-surface-content'
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}