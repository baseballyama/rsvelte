import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { geoCircle } from 'd3-geo';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'GeoPath',
	'radius',
	'center',
	'precision'
]);

export default function GeoCircle_base($$anchor, $$props) {
	$.push($$props, true);

	let radius = $.prop($$props, 'radius', 3, 90),
		center = $.prop($$props, 'center', 19, () => [0, 0]),
		precision = $.prop($$props, 'precision', 3, 6),
		restProps = $.rest_props($$props, rest_excludes);

	const geojson = $.derived(() => geoCircle().radius(radius()).center(center()).precision(precision())());
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => extractLayerProps(restProps, 'lc-geo-circle'));

		$.component(node, () => $$props.GeoPath, ($$anchor, GeoPath_1) => {
			GeoPath_1($$anchor, $.spread_props(
				{
					get geojson() {
						return $.get(geojson);
					}
				},
				() => $.get($0)
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}