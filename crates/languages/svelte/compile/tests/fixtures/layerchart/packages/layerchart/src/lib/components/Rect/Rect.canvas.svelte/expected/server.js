import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { renderRect } from '$lib/utils/canvas.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { RectState, rectMarkInfo } from './Rect.shared.svelte.js';

export default function Rect_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Declared for parity with the svg/html variants, but never set — canvas draws the rect rather
		// than creating an element for it
		let { ref: _ref = void 0, $$slots, $$events, ...rest } = $$props;

		const c = new RectState(() => rest);

		function getStyleOptions(
			styleOverrides,
			itemFill,
			itemStroke,
			itemFillOpacity,
			itemStrokeOpacity,
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
					// accepts non-string values like `CanvasPattern` / `CanvasGradient`
					// produced by `<Pattern>` / `<LinearGradient>`. `staticFill` is
					// string-only for the SVG/HTML pixel-mode templates.
					styles: {
						fill: itemFill ?? rest.fill,
						fillOpacity: itemFillOpacity ?? c.staticFillOpacity,
						stroke: itemStroke ?? rest.stroke,
						strokeOpacity: itemStrokeOpacity ?? c.staticStrokeOpacity,
						strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth,
						opacity: itemOpacity ?? c.staticOpacity
					},
					classes: cls('lc-rect', itemClass ?? c.staticClassName),
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
					const resolvedStrokeOpacity = resolveStyleProp(rest.strokeOpacity, item.d);
					const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d);
					const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
					const resolvedClass = resolveStyleProp(rest.class, item.d);
					const styleOpts = getStyleOptions(styleOverrides, resolvedFill, resolvedStroke, resolvedFillOpacity, resolvedStrokeOpacity, resolvedStrokeWidth, resolvedOpacity, resolvedClass);

					renderRect(
						ctx,
						{
							x: item.x,
							y: item.y,
							width: item.width,
							height: item.height,
							rx: c.rx,
							ry: c.ry,
							corners: c.resolveCorners(item.width, item.height)
						},
						styleOpts
					);
				}
			} else {
				const styleOpts = getStyleOptions(styleOverrides);

				renderRect(
					ctx,
					{
						x: c.motionX,
						y: c.motionY,
						width: c.motionWidth,
						height: c.motionHeight,
						rx: c.rx,
						ry: c.ry,
						corners: c.resolvedCorners
					},
					styleOpts
				);
			}
		}

		// TODO: Use objectId to work around Svelte 4 reactivity issue
		const fillKey = createKey(() => rest.fill);

		const strokeKey = createKey(() => rest.stroke);

		c.chartCtx.registerComponent({
			name: 'Rect',
			kind: 'mark',
			markInfo: () => rectMarkInfo(rest, c.dataMode),
			canvasRender: {
				render,
				events: {
					click: rest.onclick,
					dblclick: rest.ondblclick,
					pointerdown: rest.onpointerdown,
					pointerenter: rest.onpointerenter,
					pointermove: rest.onpointermove,
					pointerleave: rest.onpointerleave,
					pointerover: rest.onpointerover,
					pointerout: rest.onpointerout
				},

				deps: () => [
					c.dataMode,
					c.dataMode ? c.resolvedItems : null,
					c.motionX,
					c.motionY,
					c.motionWidth,
					c.motionHeight,
					fillKey.current,
					strokeKey.current,
					rest.fillOpacity,
					rest.strokeOpacity,
					rest.strokeWidth,
					rest.opacity,
					rest.class,
					rest.style,
					c.rx,
					c.ry,
					c.resolvedCorners,
					c.dashArrayAttr
				]
			}
		});

		$.bind_props($$props, { ref: _ref });
	});
}