import * as $ from 'svelte/internal/server';
import { index } from 'd3-array';
import { scaleQuantile } from 'd3-scale';
import { schemeBlues } from 'd3-scale-chromatic';
import { geoIdentity } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Legend, Layer, Tooltip, getSettings } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import { getUsCountiesAlbersTopology, getUsCountyPopulation } from '$lib/geo.remote.js';

const geojson = await getUsCountiesAlbersTopology();
const populationData = await getUsCountyPopulation();

export default function Choropleth($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
			enrichedCountiesFeatures: enrichedCountiesFeatures()
		};

		{
			function children($$renderer, { context }) {
				const strokeWidth = 1 / context.transform.scale;

				TransformContextControls($$renderer, {});
				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(enrichedCountiesFeatures());

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let feature = each_array[$$index];

							GeoPath($$renderer, {
								geojson: feature,
								fill: context.cScale?.(feature.properties.data?.population ?? 0),
								class: 'stroke-none hover:stroke-white',
								strokeWidth,
								tooltip: true
							});
						}

						$$renderer.push(`<!--]--> `);

						GeoPath($$renderer, {
							geojson: states,
							class: 'fill-none stroke-black/30 pointer-events-none',
							strokeWidth
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					pointerEvents: false,
					children: ($$renderer) => {
						if (context.tooltip.data && getSettings().layer === 'canvas') {
							$$renderer.push('<!--[0-->');

							GeoPath($$renderer, {
								geojson: context.tooltip.data,
								class: 'stroke-white',
								strokeWidth
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Legend($$renderer, {
					title: 'Population',
					class: 'absolute bg-surface-100/80 px-2 py-1 backdrop-blur-xs rounded-sm m-1'
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						const d = populationByFips.get(data.id);

						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.properties.name + ' - ' + data.properties.data?.state)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Total Population',
											value: d?.population,
											format: 'integer',
											valueAlign: 'right'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Est. Population under 18',
											value: d?.populationUnder18,
											format: 'integer',
											valueAlign: 'right'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Est. Percent under 18',
											value: d ? d.percentUnder18 / 100 : 0,
											format: 'percentRound',
											valueAlign: 'right'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			Chart($$renderer, {
				data: enrichedCountiesFeatures(),
				c: (d) => d.properties.data?.population ?? 0,
				cScale: scaleQuantile(),
				cDomain: colorDomain(),
				cRange: schemeBlues[9],
				geo: { projection, fitGeojson: states },
				transform: { mode: 'canvas', scrollMode: 'scale' },
				padding: { top: 60 },
				tooltipContext: { raiseTarget: getSettings().layer === 'svg' },
				height: 600,
				clip: true,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}