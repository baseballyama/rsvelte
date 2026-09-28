import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, ScaledSvg } from 'layercake';
import { feature } from 'topojson-client';
import { geoIdentity } from 'd3-geo';
import { scaleQuantize } from 'd3-scale';
import MapSvg from '../../_components/Map.svg.svelte';
import usStates from '../../_data/states-albers-10m.json';
import stateData from '../../_data/us-states-data.json';

var root = $.from_html(`<div class="map-container svelte-1ss0c3w"><!></div>`);

export default function MapSvg_1($$anchor, $$props) {
	$.push($$props, true);

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
	var div = root();

	$.set_style(div, 'padding-bottom:38.02281368821293%');

	var node = $.child(div);

	{
		let $0 = $.derived(scaleQuantize);

		LayerCake(node, {
			ssr: true,
			position: 'absolute',
			get data() {
				return geojson;
			},
			z: (d) => dataLookup.get(d[mapJoinKey]),
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
				ScaledSvg($$anchor, {
					fixedAspectRatio: aspectRatio,
					children: ($$anchor, $$slotProps) => {
						MapSvg($$anchor, {
							fixedAspectRatio: aspectRatio,
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