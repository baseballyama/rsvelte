import * as $ from 'svelte/internal/server';
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
import { getUsCountiesAlbersTopology, getUsCountyPopulation } from '$lib/geo.remote.js';

const geojson = await getUsCountiesAlbersTopology();
const populationData = await getUsCountyPopulation();

export default function Bubble_map($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
			enrichedCountiesFeatures: enrichedCountiesFeatures()
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

						$$renderer.push(`<!----> `);

						Circle($$renderer, {
							cx: (d) => d.centroid[0],
							cy: (d) => d.centroid[1],
							r: (d) => d.properties.data?.population ?? 0,
							fill: (d) => d.properties.data?.percentUnder18 ?? 0,
							stroke: (d) => d.properties.data?.percentUnder18 ?? 0,
							fillOpacity: 0.5,
							strokeWidth: strokeWidth / 2,
							class: 'pointer-events-none'
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(enrichedCountiesFeatures());

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let feature = each_array[$$index];

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
						if (context.tooltip.data && getSettings().layer === 'canvas') {
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

				Legend($$renderer, {
					title: 'Est. Percent under 18',
					placement: 'top-left',
					class: 'bg-surface-100/80 px-2 py-1 backdrop-blur-xs rounded-sm m-1'
				});

				$$renderer.push(`<!----> `);

				CircleLegend($$renderer, {
					title: 'Population',
					tickFormat: 'metric',
					placement: 'bottom-right'
				});

				$$renderer.push(`<!----> `);

				GeoLegend($$renderer, {
					units: 'mi',
					referenceScale: 1300,
					placement: 'bottom-left',
					class: 'm-2'
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
				data: enrichedCountiesFeatures(),
				r: (d) => d.properties.data?.population ?? 0,
				rRange: [0, maxRadius],
				c: (d) => d.properties.data?.percentUnder18 ?? 0,
				cScale: scaleThreshold(),
				cDomain: colorDomain(),
				cRange: colors(),
				geo: { projection, fitGeojson: states },
				transform: { mode: 'canvas', scrollMode: 'scale' },
				padding: { top: 60, right: 60 },
				height: 600,
				clip: true,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}