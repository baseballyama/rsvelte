import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { PolygonState, polygonMarkInfo } from './Polygon.shared.svelte.js';

export default function Polygon_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref: refProp = void 0, $$slots, $$events, ...rest } = $$props;
		const c = new PolygonState(() => rest);
		let ref = void 0;

		c.chartCtx.registerComponent({
			name: 'Polygon',
			kind: 'mark',
			markInfo: () => polygonMarkInfo(rest, c.dataMode)
		});

		if (c.dataMode) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.resolvedData);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let d = each_array[i];
				const pathData = c.resolvePolygonPath(d);
				const resolvedFill = resolveColorProp(rest.fill, d, c.chartCtx.cScale);
				const resolvedStroke = resolveColorProp(rest.stroke, d, c.chartCtx.cScale);
				const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, d);
				const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, d);
				const resolvedOpacity = resolveStyleProp(rest.opacity, d);
				const resolvedClass = resolveStyleProp(rest.class, d);

				$$renderer.push(`<path${$.attributes(
					{
						...rest,
						d: pathData,
						fill: resolvedFill,
						'fill-opacity': resolvedFillOpacity,
						stroke: resolvedStroke,
						'stroke-width': resolvedStrokeWidth,
						opacity: resolvedOpacity,
						class: $.clsx(cls('lc-polygon', resolvedClass))
					},
					void 0,
					void 0,
					void 0,
					3
				)}></path>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><path${$.attributes(
				{
					...rest,
					d: c.tweenedPathData,
					fill: c.staticFill,
					'fill-opacity': c.staticFillOpacity,
					stroke: c.staticStroke,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					class: $.clsx(cls('lc-polygon', c.staticClassName))
				},
				void 0,
				void 0,
				void 0,
				3
			)}></path>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref: refProp });
	});
}