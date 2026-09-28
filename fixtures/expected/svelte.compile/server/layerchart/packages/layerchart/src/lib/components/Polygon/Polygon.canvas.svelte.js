import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { renderPathData } from '$lib/utils/canvas.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { PolygonState, polygonMarkInfo } from './Polygon.shared.svelte.js';

export default function Polygon_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...rest } = $$props;
		const c = new PolygonState(() => rest);

		function getStyleOptions(
			styleOverrides,
			itemFill,
			itemStroke,
			itemFillOpacity,
			itemStrokeWidth,
			itemOpacity,
			itemClass
		) {
			return styleOverrides
				? merge(
					{
						styles: { strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth }
					},
					styleOverrides
				)
				: {
					// Use raw `rest.fill` / `rest.stroke` (not `staticFill`) so canvas
					// accepts non-string values like `CanvasPattern` / `CanvasGradient`.
					styles: {
						fill: itemFill ?? rest.fill,
						fillOpacity: itemFillOpacity ?? c.staticFillOpacity,
						stroke: itemStroke ?? rest.stroke,
						strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth,
						opacity: itemOpacity ?? c.staticOpacity
					},
					classes: cls('lc-polygon', itemClass ?? c.staticClassName),
					style: rest.style
				};
		}

		function render(ctx, styleOverrides) {
			if (c.dataMode) {
				for (const d of c.resolvedData) {
					const pathData = c.resolvePolygonPath(d);
					const resolvedFill = resolveColorProp(rest.fill, d, c.chartCtx.cScale);
					const resolvedStroke = resolveColorProp(rest.stroke, d, c.chartCtx.cScale);
					const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, d);
					const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, d);
					const resolvedOpacity = resolveStyleProp(rest.opacity, d);
					const resolvedClass = resolveStyleProp(rest.class, d);
					const styleOpts = getStyleOptions(styleOverrides, resolvedFill, resolvedStroke, resolvedFillOpacity, resolvedStrokeWidth, resolvedOpacity, resolvedClass);

					renderPathData(ctx, pathData, styleOpts);
				}
			} else {
				const styleOpts = getStyleOptions(styleOverrides);

				renderPathData(ctx, c.tweenedPathData, styleOpts);
			}
		}

		const fillKey = createKey(() => rest.fill);
		const strokeKey = createKey(() => rest.stroke);

		c.chartCtx.registerComponent({
			name: 'Polygon',
			kind: 'mark',
			markInfo: () => polygonMarkInfo(rest, c.dataMode),
			canvasRender: {
				render,
				events: {
					click: rest.onclick,
					pointerenter: rest.onpointerenter,
					pointermove: rest.onpointermove,
					pointerleave: rest.onpointerleave,
					pointerdown: rest.onpointerdown,
					pointerover: rest.onpointerover,
					pointerout: rest.onpointerout,
					touchmove: rest.ontouchmove
				},

				deps: () => [
					c.dataMode,
					c.dataMode ? c.resolvedItems : null,
					fillKey.current,
					rest.fillOpacity,
					strokeKey.current,
					rest.strokeWidth,
					rest.opacity,
					rest.class,
					c.tweenedPathData,
					rest.style
				]
			}
		});
	});
}