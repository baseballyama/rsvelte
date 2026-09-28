import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import { feature } from 'topojson-client';
import { geoAlbersUsa } from 'd3-geo';
import { scaleQuantize } from 'd3-scale';
import MapSvg from '../../_components/Map.svg.svelte';
import usStates from '../../_data/us-states.topojson.json';
import stateData from '../../_data/us-states-data.json';

var root = $.from_html(`<div class="chart-container svelte-18wc25e"><!></div>`);

export default function Map_svg($$anchor, $$props) {
	$.push($$props, true);

	// This example loads json data as json using @rollup/plugin-json
	const colorKey = 'myValue';

	/* --------------------------------------------
	 * Create lookups to more easily join our data
	 */
	const joinKey = 'name';

	const dataLookup = new Map();
	const geojson = feature(usStates, usStates.objects.collection);
	const projection = geoAlbersUsa;

	stateData.forEach((d) => {
		dataLookup.set(d[joinKey], d);
	});

	geojson.features.forEach((d) => {
		// This will overwrite any existing keys on d.properties
		// so watch out for any name collision
		Object.assign(d.properties, dataLookup.get(d.properties[joinKey]));
	});

	// Create a flat array of objects that LayerCake can use to measure
	// extents for the color scale
	const flatData = geojson.features.map((d) => d.properties);

	const colors = ['#ffdecc', '#ffc09c', '#ffa06b', '#ff7a33'];
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(scaleQuantize);

		LayerCake(node, {
			padding: { top: 10 },
			get data() {
				return geojson;
			},
			z: colorKey,
			get zScale() {
				return $.get($0);
			},

			get zRange() {
				return colors;
			},

			get flatData() {
				return flatData;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						MapSvg($$anchor, {
							get projection() {
								return projection;
							}
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}