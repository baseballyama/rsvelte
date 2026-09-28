import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Html } from 'layercake';
import { feature } from 'topojson-client';
import { geoIdentity } from 'd3-geo';
import { scaleQuantize } from 'd3-scale';
import { format } from 'd3-format';
import MapSvg from '../../_components/Map.svg.svelte';
import Tooltip from '../../_components/Tooltip.html.svelte';
import usStates from '../../_data/states-albers-10m.json';
import stateData from '../../_data/us-states-data.json';

export default function MapSvg_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads json data as json using @rollup/plugin-json
		const colorKey = 'myValue';

		/* --------------------------------------------
		 * Create lookups to more easily join our data
		 * `dataJoinKey` is the name of the field in the data
		 * `mapJoinKey` is the name of the field in the map file
		 */
		const dataJoinKey = 'name';

		const mapJoinKey = 'name';
		const dataLookup = new Map();
		const geojson = feature(usStates, usStates.objects.states);
		const projection = geoIdentity;

		stateData.forEach((d) => {
			dataLookup.set(d[dataJoinKey], d);
		});

		let tooltipEvent = null;
		let tooltipFeature = null;

		// Create a flat array of objects that LayerCake can use to measure
		// extents for the color scale
		const flatData = geojson.features.map((d) => d.properties);

		const colors = ['#ffdecc', '#ffc09c', '#ffa06b', '#ff7a33'];
		const addCommas = format(',');

		$$renderer.push(`<div class="chart-container svelte-9rgtez">`);

		LayerCake($$renderer, {
			data: geojson,
			z: (d) => dataLookup.get(d[mapJoinKey])[colorKey],
			zScale: scaleQuantize(),
			zRange: colors,
			flatData,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						MapSvg($$renderer, {
							projection,
							onmousemove: (event, feature) => {
								tooltipFeature = feature;
								tooltipEvent = event;
							},

							onmouseout: () => {
								tooltipFeature = null;
								tooltipEvent = null;
							}
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Html($$renderer, {
					pointerEvents: false,
					children: ($$renderer) => {
						if (tooltipFeature !== null && tooltipEvent !== null) {
							$$renderer.push('<!--[0-->');

							Tooltip($$renderer, {
								event: tooltipEvent,
								children: ($$renderer) => {
									const tooltipData = {
										...tooltipFeature,
										...dataLookup.get(tooltipFeature[mapJoinKey])
									};

									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(Object.entries(tooltipData));

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let [key, value] = each_array[$$index];
										const keyCapitalized = key.replace(/^\w/, (d) => d.toUpperCase());

										$$renderer.push(`<div class="row"><span>${$.escape(keyCapitalized)}:</span> ${$.escape(typeof value === 'number' ? addCommas(value) : value)}</div>`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}