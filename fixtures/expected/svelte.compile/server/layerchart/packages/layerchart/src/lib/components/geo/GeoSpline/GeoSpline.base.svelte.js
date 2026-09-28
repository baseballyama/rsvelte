import * as $ from 'svelte/internal/server';
import { geoOrthographic, geoInterpolate } from 'd3-geo';
import { line as d3Line, curveNatural } from 'd3-shape';
import { getGeoContext } from '$lib/contexts/geo.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function GeoSpline_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Path,
			link,
			loft = 1.0,
			curve = curveNatural,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const geo = getGeoContext();

		const loftedProjection = $.derived(() => geo.projection
			? geoOrthographic().translate(geo.projection.translate()).rotate(geo.projection.rotate()).scale(geo.projection.scale() * loft)
			: undefined);

		const source = $.derived(() => geo.projection ? geo.projection(link.source) : [0, 0]);
		const target = $.derived(() => geo.projection ? geo.projection(link.target) : [0, 0]);

		const middle = $.derived(() => geo.projection
			? loftedProjection()(geoInterpolate(link.source, link.target)(0.5))
			: [0, 0]);

		const d = $.derived(() => d3Line().x((d) => d[0]).y((d) => d[1]).curve(curve)([source(), middle(), target()]) ?? '');

		if (Path) {
			$$renderer.push('<!--[-->');

			Path($$renderer, $.spread_props([
				{ pathData: d() },
				extractLayerProps(restProps, 'lc-geo-spline')
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}