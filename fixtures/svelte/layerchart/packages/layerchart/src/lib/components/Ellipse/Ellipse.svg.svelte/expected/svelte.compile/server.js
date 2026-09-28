import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { EllipseState, ellipseMarkInfo } from './Ellipse.shared.svelte.js';

export default function Ellipse_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref: refProp = void 0,
			// Pull out props that collide with `<ellipse>` SVG attribute names
			cx,
			cy,
			rx: rxProp,
			ry: ryProp,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new EllipseState(() => ({ cx, cy, rx: rxProp, ry: ryProp, ...rest }));
		let ref = void 0;

		c.chartCtx.registerComponent({
			name: 'Ellipse',
			kind: 'mark',
			markInfo: () => ellipseMarkInfo({ cx, cy, rx: rxProp, ry: ryProp, ...rest }, c.dataMode)
		});

		if (c.dataMode) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.resolvedItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale);
				const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale);
				const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d);
				const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d);
				const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
				const resolvedClass = resolveStyleProp(rest.class, item.d);

				$$renderer.push(`<ellipse${$.attributes(
					{
						...rest,
						cx: item.cx,
						cy: item.cy,
						rx: item.rx,
						ry: item.ry,
						fill: resolvedFill,
						'fill-opacity': resolvedFillOpacity,
						stroke: resolvedStroke,
						'stroke-width': resolvedStrokeWidth,
						opacity: resolvedOpacity,
						class: $.clsx(cls('lc-ellipse', resolvedClass))
					},
					void 0,
					void 0,
					void 0,
					3
				)}></ellipse>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><ellipse${$.attributes(
				{
					...rest,
					cx: c.motionCx,
					cy: c.motionCy,
					rx: c.motionRx,
					ry: c.motionRy,
					fill: c.staticFill,
					'fill-opacity': c.staticFillOpacity,
					stroke: c.staticStroke,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					class: $.clsx(cls('lc-ellipse', c.staticClassName))
				},
				void 0,
				void 0,
				void 0,
				3
			)}></ellipse>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref: refProp });
	});
}