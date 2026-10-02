import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { renderRect } from '$lib/utils/canvas.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { RectState, rectMarkInfo } from './Rect.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Rect_canvas($$anchor, $$props) {
	$.push($$props, true);

	// Declared for parity with the svg/html variants, but never set — canvas draws the rect rather
	// than creating an element for it
	let rest = $.rest_props($$props, rest_excludes);

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
					fill: itemFill ?? $$props.fill,
					fillOpacity: itemFillOpacity ?? c.staticFillOpacity,
					stroke: itemStroke ?? $$props.stroke,
					strokeOpacity: itemStrokeOpacity ?? c.staticStrokeOpacity,
					strokeWidth: itemStrokeWidth ?? c.staticStrokeWidth,
					opacity: itemOpacity ?? c.staticOpacity
				},
				classes: cls('lc-rect', itemClass ?? c.staticClassName),
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
				const resolvedStrokeOpacity = resolveStyleProp($$props.strokeOpacity, item.d);
				const resolvedStrokeWidth = resolveStyleProp($$props.strokeWidth, item.d);
				const resolvedOpacity = resolveStyleProp($$props.opacity, item.d);
				const resolvedClass = resolveStyleProp($$props.class, item.d);
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
	const fillKey = createKey(() => $$props.fill);

	const strokeKey = createKey(() => $$props.stroke);

	c.chartCtx.registerComponent({
		name: 'Rect',
		kind: 'mark',
		markInfo: () => rectMarkInfo(rest, c.dataMode),
		canvasRender: {
			render,
			events: {
				click: $$props.onclick,
				dblclick: $$props.ondblclick,
				pointerdown: $$props.onpointerdown,
				pointerenter: $$props.onpointerenter,
				pointermove: $$props.onpointermove,
				pointerleave: $$props.onpointerleave,
				pointerover: $$props.onpointerover,
				pointerout: $$props.onpointerout
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
				$$props.fillOpacity,
				$$props.strokeOpacity,
				$$props.strokeWidth,
				$$props.opacity,
				$$props.class,
				$$props.style,
				c.rx,
				c.ry,
				c.resolvedCorners,
				c.dashArrayAttr
			]
		}
	});

	$.pop();
}