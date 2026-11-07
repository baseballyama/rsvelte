import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { geoOrthographic, geoInterpolate } from 'd3-geo';
import { line as d3Line, curveNatural } from 'd3-shape';
import { getGeoContext } from '$lib/contexts/geo.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Path',
	'link',
	'loft',
	'curve'
]);

export default function GeoSpline_base($$anchor, $$props) {
	$.push($$props, true);

	let loft = $.prop($$props, 'loft', 3, 1.0),
		curve = $.prop($$props, 'curve', 3, curveNatural),
		restProps = $.rest_props($$props, rest_excludes);

	const geo = getGeoContext();

	const loftedProjection = $.derived(() => geo.projection
		? geoOrthographic().translate(geo.projection.translate()).rotate(geo.projection.rotate()).scale(geo.projection.scale() * loft())
		: undefined);

	const source = $.derived(() => geo.projection ? geo.projection($$props.link.source) : [0, 0]);
	const target = $.derived(() => geo.projection ? geo.projection($$props.link.target) : [0, 0]);

	const middle = $.derived(() => geo.projection
		? $.get(loftedProjection)(geoInterpolate($$props.link.source, $$props.link.target)(0.5))
		: [0, 0]);

	const d = $.derived(() => d3Line().x((d) => d[0]).y((d) => d[1]).curve(curve())([$.get(source), $.get(middle), $.get(target)]) ?? '');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => extractLayerProps(restProps, 'lc-geo-spline'));

		$.component(node, () => $$props.Path, ($$anchor, Path_1) => {
			Path_1($$anchor, $.spread_props(
				{
					get pathData() {
						return $.get(d);
					}
				},
				() => $.get($0)
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}