import * as $ from 'svelte/internal/server';
import { geoPath as d3GeoPath, geoTransform as d3geoTransform } from 'd3-geo';
import { curveLinearClosed } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import { geoCurvePath } from '$lib/utils/geo.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';

export default function GeoPath_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Path,
			geoTransform,
			geojson,
			tooltip,
			curve = curveLinearClosed,
			onclick,
			onpointerenter,
			onpointermove,
			onpointerleave,
			class: className,
			ref: refProp = void 0,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const ctx = getChartContext();
		const geo = getGeoContext();

		const projection = $.derived(() => geoTransform && geo.projection
			? d3geoTransform(geoTransform(geo.projection))
			: geo.projection);

		const geoPath = $.derived(() => {
			geojson;

			if (!projection()) return;

			if (curve === curveLinearClosed) {
				return d3GeoPath(projection());
			}

			return geoCurvePath(projection(), curve);
		});

		const pathData = $.derived(() => geojson ? geoPath()?.(geojson) ?? '' : '');

		function _onClick(e) {
			onclick?.(e, geoPath());
		}

		function _onPointerEnter(e) {
			onpointerenter?.(e);

			if (tooltip) {
				ctx?.tooltip.show(e, geojson);
			}
		}

		function _onPointerMove(e) {
			onpointermove?.(e);

			if (tooltip) {
				ctx.tooltip.show(e, geojson);
			}
		}

		function _onPointerLeave(e) {
			onpointerleave?.(e);

			if (tooltip) {
				ctx.tooltip.hide();
			}
		}

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer, { geoPath: geoPath() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (Path) {
				$$renderer.push('<!--[-->');

				Path($$renderer, $.spread_props([
					{ pathData: pathData() },
					restProps,
					onclick && { onclick: _onClick },
					(tooltip || onpointerenter) && { onpointerenter: _onPointerEnter },
					(tooltip || onpointermove) && { onpointermove: _onPointerMove },
					(tooltip || onpointerleave) && { onpointerleave: _onPointerLeave },
					{ class: cls('lc-geo-path', className), pathRef: refProp }
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref: refProp });
	});
}