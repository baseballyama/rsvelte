import 'svelte/internal/disclose-version';
import { getUsCountiesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, ChartClipPath, Layer, Tooltip } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import GeopathControls from '$lib/components/controls/GeoPathStatesControls.svelte';
import { sort } from '@layerstack/utils';

const geojson = await getUsCountiesTopology();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Us_state_with_surrounding_states($$anchor, $$props) {
	$.push($$props, true);

	const counties = feature(geojson, geojson.objects.counties);
	const states = feature(geojson, geojson.objects.states);
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
		geojson,
		counties,
		states,
		selectedStateFeature: $.get(selectedStateFeature)
	};

	var $$exports = { data };
	var fragment = root_1();
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
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Layer(node_2, {
				children: ($$anchor, $$slotProps) => {
					ChartClipPath($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							$.each(node_3, 17, () => counties.features, $.index, ($$anchor, feature, $$index, $$array) => {
								GeoPath($$anchor, {
									get geojson() {
										return $.get(feature);
									},
									class: 'fill-surface-100 stroke-surface-content/10 hover:fill-surface-content/20',
									tooltip: true
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.each(node_4, 17, () => states.features, $.index, ($$anchor, feature, $$index_1, $$array_1) => {
								GeoPath($$anchor, {
									get geojson() {
										return $.get(feature);
									},
									class: 'fill-none pointer-events-none stroke-surface-content/10'
								});
							});

							var node_5 = $.sibling(node_4, 2);

							GeoPath(node_5, {
								get geojson() {
									return $.get(selectedStateFeature);
								},
								class: 'fill-none stroke-surface-content pointer-events-none'
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_2, 2);

			$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
				Tooltip_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, context().tooltip.data?.properties.name));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => ({
			projection: $.get(projection),
			fitGeojson: $.get(selectedStateFeature)
		}));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},
			height: 600,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}