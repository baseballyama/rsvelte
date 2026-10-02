import 'svelte/internal/disclose-version';
import { getUsCountiesAlbersTopology, getUsCountyPopulation } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { index, max, descending } from 'd3-array';
import { geoIdentity } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { feature } from 'topojson-client';
import { Chart, getSettings, Layer, Vector, Tooltip } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

const topology = await getUsCountiesAlbersTopology();
const populationData = await getUsCountyPopulation();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Spike_map($$anchor, $$props) {
	$.push($$props, true);

	let settings = getSettings();
	const projection = geoIdentity;
	const states = feature(topology, topology.objects.states);
	const counties = feature(topology, topology.objects.counties);
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
	const spikeWidth = 7;
	const maxHeight = 200;
	const heightScale = scaleLinear().domain([0, max(population, (d) => d.population) ?? 0]).range([0, maxHeight]);

	const enrichedCountiesFeatures = counties.features.map((feature) => {
		return {
			...feature,
			properties: {
				...feature.properties,
				data: populationByFips.get(feature.id)
			}
		};
	}).sort((a, b) => descending(a.properties.data?.population, b.properties.data?.population));

	const data = {
		topology,
		populationData,
		states,
		counties,
		population,
		enrichedCountiesFeatures
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

					$.each(node_3, 17, () => enrichedCountiesFeatures, $.index, ($$anchor, feature, $$index, $$array) => {
						{
							const children = ($$anchor, $$arg0) => {
								let geoPath = () => ($$arg0?.()).geoPath;

								const computed_const = $.derived(() => {
									const [x, y] = geoPath()?.centroid($.get(feature)) ?? [0, 0];

									return { x, y };
								});

								const d = $.derived(() => $.get(feature).properties.data);
								const height = $.derived(() => heightScale($.get(d)?.population ?? 0));

								Vector($$anchor, {
									get x() {
										return $.get(computed_const).x;
									},

									get y() {
										return $.get(computed_const).y;
									},

									get length() {
										return $.get(height);
									},
									shape: 'spike',
									width: spikeWidth,
									class: 'stroke-danger fill-danger/25',
									get strokeWidth() {
										return $.get(strokeWidth);
									}
								});
							};

							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},

								get strokeWidth() {
									return $.get(strokeWidth);
								},
								children,
								$$slots: { default: true }
							});
						}
					});

					var node_4 = $.sibling(node_3, 2);

					$.each(node_4, 17, () => enrichedCountiesFeatures, $.index, ($$anchor, feature, $$index_1, $$array_1) => {
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
					var fragment_6 = $.comment();
					var node_6 = $.first_child(fragment_6);

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

						$.if(node_6, ($$render) => {
							if (context().tooltip.data && settings.layer === 'canvas') $$render(consequent);
						});
					}

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_5, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					const d = $.derived(() => data().properties.data);
					var fragment_8 = root_1();
					var node_8 = $.first_child(fragment_8);

					$.component(node_8, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

					var node_9 = $.sibling(node_8, 2);

					$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root();
								var node_10 = $.first_child(fragment_10);

								{
									let $0 = $.derived(() => $.get(d)?.population);

									$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
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

								var node_11 = $.sibling(node_10, 2);

								{
									let $0 = $.derived(() => $.get(d)?.populationUnder18);

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
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

								var node_12 = $.sibling(node_11, 2);

								{
									let $0 = $.derived(() => $.get(d)?.percentUnder18 / 100);

									$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
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

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_8);
				};

				$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => ({ projection, fitGeojson: states }));

		Chart($$anchor, {
			get geo() {
				return $.get($0);
			},
			transform: { mode: 'canvas', scrollMode: 'scale' },
			height: 600,
			clip: true,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}