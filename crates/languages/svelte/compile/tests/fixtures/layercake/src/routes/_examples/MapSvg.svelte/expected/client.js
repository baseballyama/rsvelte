import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html } from 'layercake';
import { feature } from 'topojson-client';
import { geoIdentity } from 'd3-geo';
import { scaleQuantize } from 'd3-scale';
import { format } from 'd3-format';
import MapSvg from '../../_components/Map.svg.svelte';
import Tooltip from '../../_components/Tooltip.html.svelte';
import usStates from '../../_data/states-albers-10m.json';
import stateData from '../../_data/us-states-data.json';

var root = $.from_html(`<div class="row"><span> </span> </div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="chart-container svelte-9rgtez"><!></div>`);

export default function MapSvg_1($$anchor, $$props) {
	$.push($$props, true);

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

	let tooltipEvent = $.state(null);
	let tooltipFeature = $.state(null);

	// Create a flat array of objects that LayerCake can use to measure
	// extents for the color scale
	const flatData = geojson.features.map((d) => d.properties);

	const colors = ['#ffdecc', '#ffc09c', '#ffa06b', '#ff7a33'];
	const addCommas = format(',');
	var div = root_2();
	var node = $.child(div);

	{
		let $0 = $.derived(scaleQuantize);

		LayerCake(node, {
			get data() {
				return geojson;
			},
			z: (d) => dataLookup.get(d[mapJoinKey])[colorKey],
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
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				Svg(node_1, {
					children: ($$anchor, $$slotProps) => {
						MapSvg($$anchor, {
							get projection() {
								return projection;
							},

							onmousemove: (event, feature) => {
								$.set(tooltipFeature, feature, true);
								$.set(tooltipEvent, event, true);
							},

							onmouseout: () => {
								$.set(tooltipFeature, null);
								$.set(tooltipEvent, null);
							}
						});
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Html(node_2, {
					pointerEvents: false,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								Tooltip($$anchor, {
									get event() {
										return $.get(tooltipEvent);
									},

									children: ($$anchor, $$slotProps) => {
										const tooltipData = $.derived(() => ({
											...$.get(tooltipFeature),
											...dataLookup.get($.get(tooltipFeature)[mapJoinKey])
										}));

										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.each(node_4, 17, () => Object.entries($.get(tooltipData)), $.index, ($$anchor, $$item) => {
											var $$array = $.derived(() => $.to_array($.get($$item), 2));
											let key = () => $.get($$array)[0];
											let value = () => $.get($$array)[1];
											const keyCapitalized = $.derived(() => key().replace(/^\w/, (d) => d.toUpperCase()));
											var div_1 = root();
											var span = $.child(div_1);
											var text = $.only_child(span);
											var text_1 = $.sibling(span);

											$.reset(div_1);

											$.template_effect(
												($0) => {
													$.set_text(text, `${$.get(keyCapitalized) ?? ''}:`);
													$.set_text(text_1, ` ${$0 ?? ''}`);
												},
												[
													() => typeof value() === 'number' ? addCommas(value()) : value()
												]
											);

											$.append($$anchor, div_1);
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_3, ($$render) => {
								if ($.get(tooltipFeature) !== null && $.get(tooltipEvent) !== null) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_2);
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