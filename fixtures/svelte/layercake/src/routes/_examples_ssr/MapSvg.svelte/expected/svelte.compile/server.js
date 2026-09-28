import * as $ from 'svelte/internal/server';
import { LayerCake, ScaledSvg } from 'layercake';
import { feature } from 'topojson-client';
import { geoIdentity } from 'd3-geo';
import { scaleQuantize } from 'd3-scale';
import MapSvg from '../../_components/Map.svg.svelte';
import usStates from '../../_data/states-albers-10m.json';
import stateData from '../../_data/us-states-data.json';

export default function MapSvg_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// For a map example with a tooltip, check out https://layercake.graphics/example/MapSvg
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

		stateData.forEach((d) => {
			dataLookup.set(d[dataJoinKey], d[colorKey]);
		});

		const geojson = feature(usStates, usStates.objects.states);
		const aspectRatio = 2.63;
		const projection = geoIdentity;

		// Create a flat array of objects that LayerCake can use to measure
		// extents for the color scale
		const flatData = geojson.features.map((d) => d.properties);

		const colors = ['#ffdecc', '#ffc09c', '#ffa06b', '#ff7a33'];

		$$renderer.push(`<div class="map-container svelte-1ss0c3w" style="padding-bottom:38.02281368821293%">`);

		LayerCake($$renderer, {
			ssr: true,
			position: 'absolute',
			data: geojson,
			z: (d) => dataLookup.get(d[mapJoinKey]),
			zScale: scaleQuantize(),
			zRange: colors,
			flatData,
			children: ($$renderer) => {
				ScaledSvg($$renderer, {
					fixedAspectRatio: aspectRatio,
					children: ($$renderer) => {
						MapSvg($$renderer, { fixedAspectRatio: aspectRatio, projection });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}