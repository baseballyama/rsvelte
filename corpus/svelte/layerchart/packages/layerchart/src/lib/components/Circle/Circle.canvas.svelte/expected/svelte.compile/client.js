import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { renderCircle } from '$lib/utils/canvas.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { CircleState, circleMarkInfo } from './Circle.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Circle_canvas($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const c = new CircleState(() => rest);

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
				classes: cls('lc-circle', itemClass ?? c.staticClassName),
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

				renderCircle(ctx, item, styleOpts);
			}
		} else {
			const styleOpts = getStyleOptions(styleOverrides);

			renderCircle(ctx, { cx: c.motionCx, cy: c.motionCy, r: c.motionR }, styleOpts);
		}
	}

	// TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
	const fillKey = createKey(() => $$props.fill);

	const strokeKey = createKey(() => $$props.stroke);

	c.chartCtx.registerComponent({
		name: 'Circle',
		kind: 'mark',
		markInfo: () => circleMarkInfo(rest, c.dataMode),
		canvasRender: {
			render,
			events: {
				click: $$props.onclick,
				pointerdown: $$props.onpointerdown,
				pointerenter: $$props.onpointerenter,
				pointermove: $$props.onpointermove,
				pointerleave: $$props.onpointerleave
			},

			deps: () => [
				c.dataMode,
				c.dataMode ? c.resolvedItems : null,
				c.motionCx,
				c.motionCy,
				c.motionR,
				fillKey.current,
				$$props.fillOpacity,
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