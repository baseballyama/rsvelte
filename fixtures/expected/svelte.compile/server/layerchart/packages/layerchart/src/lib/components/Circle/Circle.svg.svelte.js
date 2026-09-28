import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { CircleState, circleMarkInfo } from './Circle.shared.svelte.js';

export default function Circle_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref: refProp = void 0, $$slots, $$events, ...rest } = $$props;
		const c = new CircleState(() => rest);
		let ref = void 0;

		c.chartCtx.registerComponent({
			name: 'Circle',
			kind: 'mark',
			markInfo: () => circleMarkInfo(rest, c.dataMode)
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

				$$renderer.push(`<circle${$.attributes(
					{
						...rest,
						cx: item.cx,
						cy: item.cy,
						r: item.r,
						fill: resolvedFill,
						'fill-opacity': resolvedFillOpacity,
						stroke: resolvedStroke,
						'stroke-width': resolvedStrokeWidth,
						opacity: resolvedOpacity,
						'stroke-dasharray': c.dashArrayAttr,
						class: $.clsx(cls('lc-circle', resolvedClass))
					},
					void 0,
					void 0,
					void 0,
					3
				)}></circle>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><circle${$.attributes(
				{
					...rest,
					cx: c.motionCx,
					cy: c.motionCy,
					r: c.motionR,
					fill: c.staticFill,
					'fill-opacity': c.staticFillOpacity,
					stroke: c.staticStroke,
					'stroke-width': c.staticStrokeWidth,
					opacity: c.staticOpacity,
					'stroke-dasharray': c.dashArrayAttr,
					class: $.clsx(cls('lc-circle', c.staticClassName))
				},
				void 0,
				void 0,
				void 0,
				3
			)}></circle>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref: refProp });
	});
}