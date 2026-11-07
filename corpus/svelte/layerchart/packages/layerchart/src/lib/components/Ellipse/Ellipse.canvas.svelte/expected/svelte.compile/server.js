import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { renderEllipse } from '$lib/utils/canvas.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { EllipseState, ellipseMarkInfo } from './Ellipse.shared.svelte.js';

export default function Ellipse_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...rest } = $$props;
		const c = new EllipseState(() => rest);

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
					classes: cls('lc-ellipse', itemClass ?? c.staticClassName)
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

					renderEllipse(ctx, item, styleOpts);
				}
			} else {
				const styleOpts = getStyleOptions(styleOverrides);

				renderEllipse(
					ctx,
					{
						cx: c.motionCx,
						cy: c.motionCy,
						rx: c.motionRx,
						ry: c.motionRy
					},
					styleOpts
				);
			}
		}

		const fillKey = createKey(() => rest.fill);
		const strokeKey = createKey(() => rest.stroke);

		c.chartCtx.registerComponent({
			name: 'Ellipse',
			kind: 'mark',
			markInfo: () => ellipseMarkInfo(rest, c.dataMode),
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
					c.motionRx,
					c.motionRy,
					fillKey.current,
					rest.fillOpacity,
					strokeKey.current,
					rest.strokeWidth,
					rest.opacity,
					rest.class
				]
			}
		});
	});
}