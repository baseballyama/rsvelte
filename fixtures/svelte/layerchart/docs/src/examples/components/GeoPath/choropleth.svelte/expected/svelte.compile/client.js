import 'svelte/internal/disclose-version';
import { getUsCountiesAlbersTopology, getUsCountyPopulation } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { index } from 'd3-array';
import { scaleQuantile } from 'd3-scale';
import { schemeBlues } from 'd3-scale-chromatic';
import { geoIdentity } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Legend, Layer, Tooltip, getSettings } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

const geojson = await getUsCountiesAlbersTopology();
const populationData = await getUsCountyPopulation();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Choropleth($$anchor, $$props) {
	$.push($$props, true);

	const states = feature(geojson, geojson.objects.states);
	const counties = feature(geojson, geojson.objects.counties);
	const projection = geoIdentity;
	const statesById = index(states.features, (d) => d.id);

	const population = populationData.map((d) => {
		return {
			id: d.state + d.county,
			state: statesById.get(d.state)?.properties.name,
			population: +d.DP05_0001E,
			populationUnder18: +d.DP05_0019E,
			percentUnder18: +d.DP05_0019PE
		};
	});

	const populationByFips = index(population, (d) => d.id);

	const enrichedCountiesFeatures = $.derived(() => counties.features.map((feature) => {
		return {
			...feature,
			properties: {
				...feature.properties,
				data: populationByFips.get(feature.id)
			}
		};
	}));

	const colorDomain = $.derived(() => population.map((d) => d.population));

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

					$.each(node_2, 17, () => $.get(enrichedCountiesFeatures), $.index, ($$anchor, feature, $$index, $$array) => {
						{
							let $0 = $.derived(() => context().cScale?.($.get(feature).properties.data?.population ?? 0));

							GeoPath($$anchor, {
								get geojson() {
									return $.get(feature);
								},

								get fill() {
									return $.get($0);
								},
								class: 'stroke-none hover:stroke-white',
								get strokeWidth() {
									return $.get(strokeWidth);
								},
								tooltip: true
							});
						}
					});

					var node_3 = $.sibling(node_2, 2);

					GeoPath(node_3, {
						get geojson() {
							return states;
						},
						class: 'fill-none stroke-black/30 pointer-events-none',
						get strokeWidth() {
							return $.get(strokeWidth);
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Layer(node_4, {
				pointerEvents: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					{
						var consequent = ($$anchor) => {
							GeoPath($$anchor, {
								get geojson() {
									return context().tooltip.data;
								},
								class: 'stroke-white',
								get strokeWidth() {
									return $.get(strokeWidth);
								}
							});
						};

						var d_1 = $.derived(() => context().tooltip.data && getSettings().layer === 'canvas');

						$.if(node_5, ($$render) => {
							if ($.get(d_1)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Legend(node_6, {
				title: 'Population',
				class: 'absolute bg-surface-100/80 px-2 py-1 backdrop-blur-xs rounded-sm m-1'
			});

			var node_7 = $.sibling(node_6, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					const d = $.derived(() => populationByFips.get(data().id));
					var fragment_6 = root();
					var node_8 = $.first_child(fragment_6);

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
								var fragment_8 = root_1();
								var node_10 = $.first_child(fragment_8);

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
									let $0 = $.derived(() => $.get(d) ? $.get(d).percentUnder18 / 100 : 0);

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

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				};

				$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(scaleQuantile);
		let $1 = $.derived(() => ({ projection, fitGeojson: states }));
		let $2 = $.derived(() => ({ raiseTarget: getSettings().layer === 'svg' }));

		Chart($$anchor, {
			get data() {
				return $.get(enrichedCountiesFeatures);
			},
			c: (d) => d.properties.data?.population ?? 0,
			get cScale() {
				return $.get($0);
			},

			get cDomain() {
				return $.get(colorDomain);
			},

			get cRange() {
				return schemeBlues[9];
			},

			get geo() {
				return $.get($1);
			},
			transform: { mode: 'canvas', scrollMode: 'scale' },
			padding: { top: 60 },
			get tooltipContext() {
				return $.get($2);
			},
			height: 600,
			clip: true,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}