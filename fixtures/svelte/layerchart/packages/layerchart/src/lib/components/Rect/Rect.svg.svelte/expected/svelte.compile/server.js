import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { RectState, rectMarkInfo } from './Rect.shared.svelte.js';

export default function Rect_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref: refProp = void 0,
			// Pull out props that collide with `<rect>` SVG attribute names so
			// `{...rest}` spread doesn't override our explicit values.
			x,
			y,
			width,
			height,
			rx: rxProp,
			ry: ryProp,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new RectState(() => ({ x, y, width, height, rx: rxProp, ry: ryProp, ...rest }));
		let ref = void 0;

		c.chartCtx.registerComponent({
			name: 'Rect',
			kind: 'mark',
			markInfo: () => rectMarkInfo({ x, y, width, height, rx: rxProp, ry: ryProp, ...rest }, c.dataMode)
		});

		if (c.dataMode) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.resolvedItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale);
				const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale);
				const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d);
				const resolvedStrokeOpacity = resolveStyleProp(rest.strokeOpacity, item.d);
				const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d);
				const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
				const resolvedClass = resolveStyleProp(rest.class, item.d);
				const pathData = c.roundedRectPath(item.x, item.y, item.width, item.height);

				if (pathData) {
					$$renderer.push(`<!--[0--><path${$.attributes(
						{
							...rest,
							d: pathData,
							fill: resolvedFill,
							'fill-opacity': resolvedFillOpacity,
							stroke: resolvedStroke,
							'stroke-opacity': resolvedStrokeOpacity,
							'stroke-width': resolvedStrokeWidth,
							opacity: resolvedOpacity,
							'stroke-dasharray': c.dashArrayAttr,
							class: $.clsx(cls('lc-rect', resolvedClass))
						},
						void 0,
						void 0,
						void 0,
						3
					)}></path>`);
				} else {
					$$renderer.push(`<!--[-1--><rect${$.attributes(
						{
							...rest,
							x: item.x,
							y: item.y,
							width: item.width,
							height: item.height,
							fill: resolvedFill,
							'fill-opacity': resolvedFillOpacity,
							stroke: resolvedStroke,
							'stroke-opacity': resolvedStrokeOpacity,
							'stroke-width': resolvedStrokeWidth,
							opacity: resolvedOpacity,
							rx: c.rx,
							ry: c.ry,
							'stroke-dasharray': c.dashArrayAttr,
							class: $.clsx(cls('lc-rect', resolvedClass))
						},
						void 0,
						void 0,
						void 0,
						3
					)}></rect>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else if (c.pixelPathData) {
			$$renderer.push(`<!--[1--><path${$.attributes(
				{
					...rest,
					d: c.pixelPathData,
					fill: c.staticFill,
					'fill-opacity': c.staticFillOpacity,
					stroke: c.staticStroke,
					'stroke-opacity': c.staticStrokeOpacity,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					'stroke-dasharray': c.dashArrayAttr,
					class: $.clsx(cls('lc-rect', c.staticClassName))
				},
				void 0,
				void 0,
				void 0,
				3
			)}></path>`);
		} else {
			$$renderer.push(`<!--[-1--><rect${$.attributes(
				{
					...rest,
					x: c.motionX,
					y: c.motionY,
					width: c.motionWidth,
					height: c.motionHeight,
					fill: c.staticFill,
					'fill-opacity': c.staticFillOpacity,
					stroke: c.staticStroke,
					'stroke-opacity': c.staticStrokeOpacity,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					rx: c.rx,
					ry: c.ry,
					'stroke-dasharray': c.dashArrayAttr,
					class: $.clsx(cls('lc-rect', c.staticClassName))
				},
				void 0,
				void 0,
				void 0,
				3
			)}></rect>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref: refProp });
	});
}