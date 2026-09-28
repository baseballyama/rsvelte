import * as $ from 'svelte/internal/server';
import { index, max, descending } from 'd3-array';
import { geoIdentity } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { feature } from 'topojson-client';
import { Chart, getSettings, Layer, Vector, Tooltip } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import { getUsCountiesAlbersTopology, getUsCountyPopulation } from '$lib/geo.remote.js';

const topology = await getUsCountiesAlbersTopology();
const populationData = await getUsCountyPopulation();

export default function Spike_map($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		{
			function children($$renderer, { context }) {
				const strokeWidth = 1 / context.transform.scale;

				TransformContextControls($$renderer, {});
				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					children: ($$renderer) => {
						GeoPath($$renderer, {
							geojson: states,
							class: 'fill-surface-content/10 stroke-surface-100',
							strokeWidth
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(enrichedCountiesFeatures);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let feature = each_array[$$index];

							{
								function children($$renderer, { geoPath }) {
									const [x, y] = geoPath?.centroid(feature) ?? [0, 0];
									const d = feature.properties.data;
									const height = heightScale(d?.population ?? 0);

									Vector($$renderer, {
										x,
										y,
										length: height,
										shape: 'spike',
										width: spikeWidth,
										class: 'stroke-danger fill-danger/25',
										strokeWidth
									});
								}

								GeoPath($$renderer, {
									geojson: feature,
									strokeWidth,
									children,
									$$slots: { default: true }
								});
							}
						}

						$$renderer.push(`<!--]--> <!--[-->`);

						const each_array_1 = $.ensure_array_like(enrichedCountiesFeatures);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let feature = each_array_1[$$index_1];

							GeoPath($$renderer, {
								geojson: feature,
								tooltip: true,
								class: 'stroke-none hover:fill-surface-content/10',
								strokeWidth
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					pointerEvents: false,
					children: ($$renderer) => {
						if (context.tooltip.data && settings.layer === 'canvas') {
							$$renderer.push('<!--[0-->');

							GeoPath($$renderer, {
								geojson: context.tooltip.data,
								class: 'stroke-none fill-surface-content/10',
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

				{
					function children($$renderer, { data }) {
						const d = data.properties.data;

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
											value: d?.percentUnder18 / 100,
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
				geo: { projection, fitGeojson: states },
				transform: { mode: 'canvas', scrollMode: 'scale' },
				height: 600,
				clip: true,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}