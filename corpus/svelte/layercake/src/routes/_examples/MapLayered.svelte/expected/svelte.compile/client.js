import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-1we5mv9"><!></div>`);

export default function MapLayered($$anchor, $$props) {
	$.push($$props, true);

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
	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(scaleQuantize);

		LayerCake(node, {
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
				var fragment = root();
				var node_1 = $.first_child(fragment);

				Canvas(node_1, {
					children: ($$anchor, $$slotProps) => {
						MapCanvas($$anchor, {
							get projection() {
								return projection;
							},
							fill: '#fff'
						});
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Svg(node_2, {
					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => geojson.features.slice(40, 50));

							MapSvg($$anchor, {
								get projection() {
									return projection;
								},

								get features() {
									return $.get($0);
								}
							});
						}
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_2, 2);

				Html(node_3, {
					pointerEvents: false,
					children: ($$anchor, $$slotProps) => {
						MapLabels($$anchor, {
							get projection() {
								return projection;
							},

							get features() {
								return labelsToDisplay;
							},
							getCoordinates: (d) => d[labelCoordinatesKey],
							getLabel: (d) => d[labelNameKey]
						});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}