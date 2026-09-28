import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { renderPathData } from '$lib/utils/canvas.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { LineState, lineMarkInfo } from './Line.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Line_canvas($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const c = new LineState(() => rest);

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
				classes: cls('lc-line', itemClass ?? c.staticClassName),
				style: [
					$$props.style,
					c.dashArrayAttr ? `stroke-dasharray: ${c.dashArrayAttr}` : undefined
				].filter(Boolean).join('; ') || undefined
			};
	}

	function render(ctx, styleOverrides) {
		if (c.dataMode) {
			for (const item of c.resolvedItems) {
				const resolvedFill = resolveColorProp($$props.fill, item.d, c.chartCtx.cScale);
				const resolvedStroke = resolveColorProp($$props.stroke, item.d, c.chartCtx.cScale);
				const resolvedFillOpacity = resolveStyleProp($$props.fillOpacity, item.d);
				const resolvedStrokeWidth = resolveStyleProp($$props.strokeWidth, item.d);
				const resolvedOpacity = resolveStyleProp($$props.opacity, item.d);
				const resolvedClass = resolveStyleProp($$props.class, item.d);
				const styleOpts = getStyleOptions(styleOverrides, resolvedFill, resolvedStroke, resolvedFillOpacity, resolvedStrokeWidth, resolvedOpacity, resolvedClass);
				const pathData = `M ${item.x1},${item.y1} L ${item.x2},${item.y2}`;

				renderPathData(ctx, pathData, styleOpts);
			}
		} else {
			const styleOpts = getStyleOptions(styleOverrides);
			const pathData = `M ${c.motionX1},${c.motionY1} L ${c.motionX2},${c.motionY2}`;

			renderPathData(ctx, pathData, styleOpts);
		}
	}

	const fillKey = createKey(() => $$props.fill);
	const strokeKey = createKey(() => $$props.stroke);

	c.chartCtx.registerComponent({
		name: 'Line',
		kind: 'mark',
		markInfo: () => lineMarkInfo(rest, c.dataMode),
		canvasRender: {
			render,
			events: {
				click: $$props.onclick,
				pointerenter: $$props.onpointerenter,
				pointermove: $$props.onpointermove,
				pointerleave: $$props.onpointerleave
			},

			deps: () => [
				c.dataMode,
				c.dataMode ? c.resolvedItems : null,
				c.motionX1,
				c.motionY1,
				c.motionX2,
				c.motionY2,
				fillKey.current,
				strokeKey.current,
				$$props.strokeWidth,
				$$props.opacity,
				$$props.class,
				$$props.style,
				c.dashArrayAttr
			]
		}
	});

	$.pop();
}