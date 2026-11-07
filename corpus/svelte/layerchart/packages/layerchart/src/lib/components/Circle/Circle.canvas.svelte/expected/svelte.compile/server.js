import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { renderCircle } from '$lib/utils/canvas.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { CircleState, circleMarkInfo } from './Circle.shared.svelte.js';

export default function Circle_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...rest } = $$props;
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
						fill: itemFill ?? rest.fill,
						fillOpacity: itemFillOpacity ?? c.staticFillOpacity,
						stroke: itemStroke ?? rest.stroke,
						strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth,
						opacity: itemOpacity ?? c.staticOpacity
					},
					classes: cls('lc-circle', itemClass ?? c.staticClassName),
					style: [
						rest.style,
						c.dashArrayAttr ? `stroke-dasharray: ${c.dashArrayAttr}` : undefined
					].filter(Boolean).join('; ') || undefined
				};
		}

		function render(ctx, styleOverrides) {
			if (c.dataMode) {
				for (const item of c.resolvedItems) {
					const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale);
					const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale);
					const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d);
					const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d);
					const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
					const resolvedClass = resolveStyleProp(rest.class, item.d);
					const styleOpts = getStyleOptions(styleOverrides, resolvedFill, resolvedStroke, resolvedFillOpacity, resolvedStrokeWidth, resolvedOpacity, resolvedClass);

					renderCircle(ctx, item, styleOpts);
				}
			} else {
				const styleOpts = getStyleOptions(styleOverrides);

				renderCircle(ctx, { cx: c.motionCx, cy: c.motionCy, r: c.motionR }, styleOpts);
			}
		}

		// TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
		const fillKey = createKey(() => rest.fill);

		const strokeKey = createKey(() => rest.stroke);

		c.chartCtx.registerComponent({
			name: 'Circle',
			kind: 'mark',
			markInfo: () => circleMarkInfo(rest, c.dataMode),
			canvasRender: {
				render,
				events: {
					click: rest.onclick,
					pointerdown: rest.onpointerdown,
					pointerenter: rest.onpointerenter,
					pointermove: rest.onpointermove,
					pointerleave: rest.onpointerleave
				},

				deps: () => [
					c.dataMode,
					c.dataMode ? c.resolvedItems : null,
					c.motionCx,
					c.motionCy,
					c.motionR,
					fillKey.current,
					rest.fillOpacity,
					strokeKey.current,
					rest.strokeWidth,
					rest.opacity,
					rest.class,
					rest.style,
					c.dashArrayAttr
				]
			}
		});
	});
}