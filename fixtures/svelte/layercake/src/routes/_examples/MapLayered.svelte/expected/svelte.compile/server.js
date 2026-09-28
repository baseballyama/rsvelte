import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Canvas, Html } from 'layercake';
import { feature } from 'topojson-client';
import { geoAlbersUsa } from 'd3-geo';
import { scaleQuantize } from 'd3-scale';
import MapSvg from '../../_components/Map.svg.svelte';
import MapCanvas from '../../_components/Map.canvas.svelte';
import MapLabels from '../../_components/MapLabels.html.svelte';
import usStates from '../../_data/us-states.topojson.json';
import stateData from '../../_data/us-states-data.json';
import stateLabels from '../../_data/us-states-labels.json';

export default function MapLayered($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// For a map example with a tooltip, check out https://layercake.graphics/example/MapSvg
		// This example loads json data as json using @rollup/plugin-json
		const colorKey = 'myValue';

		const labelCoordinatesKey = 'center';
		const labelNameKey = 'abbr';

		/** @type {import('geojson').FeatureCollection} */
		// @ts-ignore - topojson feature() can return FeatureCollection
		const geojson = feature(usStates, usStates.objects.collection);

		const projection = geoAlbersUsa;

		/* --------------------------------------------
		 * Create lookups to more easily join our data
		 * `dataJoinKey` is the name of the field in the data
		 * `mapJoinKey` is the name of the field in the map file
		 */
		const dataJoinKey = 'name';

		const mapJoinKey = 'name';
		const dataLookup = new Map();

		stateData.forEach(/** @param {any} d */ (d) => {
			dataLookup.set(d[dataJoinKey], d[colorKey]);
		});

		// Exclude some for space reasons
		const labelsToExclude = ['VT', 'MD', 'NJ', 'RI', 'DC', 'DE', 'WV', 'MA', 'CT', 'NH'];

		const labelsToDisplay = stateLabels.filter(/** @param {any} d */ (d) => {
			return !labelsToExclude.includes(d[labelNameKey]);
		});

		// Create a flat array of objects that LayerCake can use to measure
		// extents for the color scale
		const flatData = geojson.features.map((d) => d.properties).filter((d) => d !== null && d !== undefined);

		const colors = ['#ffdecc', '#ffc09c', '#ffa06b', '#ff7a33'];

		$$renderer.push(`<div class="chart-container svelte-1we5mv9">`);

		LayerCake($$renderer, {
			data: geojson,
			z: (/** @type {any} */ d) => dataLookup.get(d[mapJoinKey]),
			zScale: scaleQuantize(),
			zRange: colors,
			flatData,
			children: ($$renderer) => {
				Canvas($$renderer, {
					children: ($$renderer) => {
						MapCanvas($$renderer, { projection, fill: '#fff' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Svg($$renderer, {
					children: ($$renderer) => {
						MapSvg($$renderer, { projection, features: geojson.features.slice(40, 50) });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Html($$renderer, {
					pointerEvents: false,
					children: ($$renderer) => {
						MapLabels($$renderer, {
							projection,
							features: labelsToDisplay,
							getCoordinates: (d) => d[labelCoordinatesKey],
							getLabel: (d) => d[labelNameKey]
						});
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