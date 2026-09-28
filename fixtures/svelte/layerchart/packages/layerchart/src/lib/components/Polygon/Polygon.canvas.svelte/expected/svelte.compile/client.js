import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { renderPathData } from '$lib/utils/canvas.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { PolygonState, polygonMarkInfo } from './Polygon.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Polygon_canvas($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
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
					fill: itemFill ?? $$props.fill,
					fillOpacity: itemFillOpacity ?? c.staticFillOpacity,
					stroke: itemStroke ?? $$props.stroke,
					strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth,
					opacity: itemOpacity ?? c.staticOpacity
				},
				classes: cls('lc-polygon', itemClass ?? c.staticClassName),
				style: $$props.style
			};
	}

	function render(ctx, styleOverrides) {
		if (c.dataMode) {
			for (const d of c.resolvedData) {
				const pathData = c.resolvePolygonPath(d);
				const resolvedFill = resolveColorProp($$props.fill, d, c.chartCtx.cScale);
				const resolvedStroke = resolveColorProp($$props.stroke, d, c.chartCtx.cScale);
				const resolvedFillOpacity = resolveStyleProp($$props.fillOpacity, d);
				const resolvedStrokeWidth = resolveStyleProp($$props.strokeWidth, d);
				const resolvedOpacity = resolveStyleProp($$props.opacity, d);
				const resolvedClass = resolveStyleProp($$props.class, d);
				const styleOpts = getStyleOptions(styleOverrides, resolvedFill, resolvedStroke, resolvedFillOpacity, resolvedStrokeWidth, resolvedOpacity, resolvedClass);

				renderPathData(ctx, pathData, styleOpts);
			}
		} else {
			const styleOpts = getStyleOptions(styleOverrides);

			renderPathData(ctx, c.tweenedPathData, styleOpts);
		}
	}

	const fillKey = createKey(() => $$props.fill);
	const strokeKey = createKey(() => $$props.stroke);

	c.chartCtx.registerComponent({
		name: 'Polygon',
		kind: 'mark',
		markInfo: () => polygonMarkInfo(rest, c.dataMode),
		canvasRender: {
			render,
			events: {
				click: $$props.onclick,
				pointerenter: $$props.onpointerenter,
				pointermove: $$props.onpointermove,
				pointerleave: $$props.onpointerleave,
				pointerdown: $$props.onpointerdown,
				pointerover: $$props.onpointerover,
				pointerout: $$props.onpointerout,
				touchmove: $$props.ontouchmove
			},

			deps: () => [
				c.dataMode,
				c.dataMode ? c.resolvedItems : null,
				fillKey.current,
				$$props.fillOpacity,
				strokeKey.current,
				$$props.strokeWidth,
				$$props.opacity,
				$$props.class,
				c.tweenedPathData,
				$$props.style
			]
		}
	});

	$.pop();
}