import 'svelte/internal/disclose-version';
import { getUsCountiesAlbersTopology, getUsCountyPopulation } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { index, max } from 'd3-array';
import { geoIdentity, geoPath } from 'd3-geo';
import { scaleThreshold } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { quantize } from 'd3-interpolate';
import { feature } from 'topojson-client';
import { sortFunc } from '@layerstack/utils';

import {
	Chart,
	Circle,
	CircleLegend,
	Layer,
	Legend,
	Tooltip,
	getSettings
} from 'layerchart';

import { GeoLegend, GeoPath } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

const geojson = await getUsCountiesAlbersTopology();
const populationData = await getUsCountyPopulation();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Bubble_map($$anchor, $$props) {
	$.push($$props, true);

	const states = feature(geojson, geojson.objects.states);
	const counties = feature(geojson, geojson.objects.counties);
	const projection = geoIdentity;
	const statesById = index(states.features, (d) => d.id);

	const population = populationData.map((d) => {
		return {
			fips: d.state + d.county,
			state: statesById.get(d.state)?.properties.name,
			population: +d.DP05_0001E,
			populationUnder18: +d.DP05_0019E,
			percentUnder18: +d.DP05_0019PE
		};
	});

	const populationByFips = index(population, (d) => d.fips);
	const maxRadius = 40;
	const colors = $.derived(() => quantize(interpolateViridis, 5));

	const colorDomain = $.derived(() => [
		16,
		20,
		24,
		28,
		Math.ceil(max(population, (d) => d.percentUnder18) ?? 0)
	]);

	// Precompute each county's centroid in raw (pre-fit) coordinates so we can
	// use data-driven Circle, which projects [cx, cy] through the chart's
	// projection at render time.
	const rawPath = geoPath();

	const enrichedCountiesFeatures = $.derived(() => counties.features.map((feature) => {
		return {
			...feature,
			centroid: rawPath.centroid(feature),
			properties: {
				...feature.properties,
				data: populationByFips.get(String(feature.id))
			}
		};
	}).sort(sortFunc('properties.data.population', 'desc')));

	const data = {
		geojson,
		populationData,
		states,
		counties,
		population,
		enrichedCountiesFeatures: $.get(enrichedCountiesFeatures)
	};

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const strokeWidth = $.derived(() => 1 / context().transform.scale);
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			TransformContextControls(node, {});

			var node_1 = $.sibling(node, 2);

			Layer(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					GeoPath(node_2, {
						get geojson() {
							return states;
						},
						class: 'fill-surface-content/10 stroke-surface-100',
						get strokeWidth() {
							return $.get(strokeWidth);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => $.get(strokeWidth) / 2);

						Circle(node_3, {
							cx: (d) => d.centroid[0],
							cy: (d) => d.centroid[1],
							r: (d) => d.properties.data?.population ?? 0,
							fill: (d) => d.properties.data?.percentUnder18 ?? 0,
							stroke: (d) => d.properties.data?.percentUnder18 ?? 0,
							fillOpacity: 0.5,
							get strokeWidth() {
								return $.get($0);
							},
							class: 'pointer-events-none'
						});
					}

					var node_4 = $.sibling(node_3, 2);

					$.each(node_4, 17, () => $.get(enrichedCountiesFeatures), $.index, ($$anchor, feature, $$index, $$array) => {
						GeoPath($$anchor, {
							get geojson() {
								return $.get(feature);
							},
							tooltip: true,
							class: 'stroke-none hover:fill-surface-content/10',
							get strokeWidth() {
								return $.get(strokeWidth);
							}
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_1, 2);

			Layer(node_5, {
				pointerEvents: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_6 = $.first_child(fragment_4);

					{
						var consequent = ($$anchor) => {
							GeoPath($$anchor, {
								get geojson() {
									return context().tooltip.data;
								},
								class: 'stroke-none fill-surface-content/10',
								get strokeWidth() {
									return $.get(strokeWidth);
								}
							});
						};

						var d_1 = $.derived(() => context().tooltip.data && getSettings().layer === 'canvas');

						$.if(node_6, ($$render) => {
							if ($.get(d_1)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_5, 2);

			Legend(node_7, {
				title: 'Est. Percent under 18',
				placement: 'top-left',
				class: 'bg-surface-100/80 px-2 py-1 backdrop-blur-xs rounded-sm m-1'
			});

			var node_8 = $.sibling(node_7, 2);

			CircleLegend(node_8, {
				title: 'Population',
				tickFormat: 'metric',
				placement: 'bottom-right'
			});

			var node_9 = $.sibling(node_8, 2);

			GeoLegend(node_9, {
				units: 'mi',
				referenceScale: 1300,
				placement: 'bottom-left',
				class: 'm-2'
			});

			var node_10 = $.sibling(node_9, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					const d = $.derived(() => data().properties.data);
					var fragment_6 = root_1();
					var node_11 = $.first_child(fragment_6);

					$.component(node_11, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().properties.name + ' - ' + data().properties.data?.state));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_12 = $.sibling(node_11, 2);

					$.component(node_12, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root();
								var node_13 = $.first_child(fragment_8);

								{
									let $0 = $.derived(() => $.get(d)?.population);

									$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Total Population',
											get value() {
												return $.get($0);
											},
											format: 'integer',
											valueAlign: 'right'
										});
									});
								}

								var node_14 = $.sibling(node_13, 2);

								{
									let $0 = $.derived(() => $.get(d)?.populationUnder18);

									$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Est. Population under 18',
											get value() {
												return $.get($0);
											},
											format: 'integer',
											valueAlign: 'right'
										});
									});
								}

								var node_15 = $.sibling(node_14, 2);

								{
									let $0 = $.derived(() => $.get(d)?.percentUnder18 / 100);

									$.component(node_15, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
										Tooltip_Item_2($$anchor, {
											label: 'Est. Percent under 18',
											get value() {
												return $.get($0);
											},
											format: 'percentRound',
											valueAlign: 'right'
										});
									});
								}

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				};

				$.component(node_10, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(scaleThreshold);
		let $1 = $.derived(() => ({ projection, fitGeojson: states }));

		Chart($$anchor, {
			get data() {
				return $.get(enrichedCountiesFeatures);
			},
			r: (d) => d.properties.data?.population ?? 0,
			rRange: [0, maxRadius],
			c: (d) => d.properties.data?.percentUnder18 ?? 0,
			get cScale() {
				return $.get($0);
			},

			get cDomain() {
				return $.get(colorDomain);
			},

			get cRange() {
				return $.get(colors);
			},

			get geo() {
				return $.get($1);
			},
			transform: { mode: 'canvas', scrollMode: 'scale' },
			padding: { top: 60, right: 60 },
			height: 600,
			clip: true,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}