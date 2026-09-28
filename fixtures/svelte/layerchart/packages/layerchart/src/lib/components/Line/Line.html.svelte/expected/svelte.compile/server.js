import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { pointsToAngleAndLength } from '$lib/utils/math.js';
import { dashArrayToGradient } from '$lib/utils/path.js';
import { LineState, lineMarkInfo } from './Line.shared.svelte.js';

export default function Line_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...rest } = $$props;
		const c = new LineState(() => rest);

		c.chartCtx.registerComponent({
			name: 'Line',
			kind: 'mark',
			markInfo: () => lineMarkInfo(rest, c.dataMode)
		});

		if (c.dataMode) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.resolvedItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale);
				const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d);
				const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
				const resolvedClass = resolveStyleProp(rest.class, item.d);
				const { angle, length } = pointsToAngleAndLength({ x: item.x1, y: item.y1 }, { x: item.x2, y: item.y2 });

				$$renderer.push(`<div${$.attr_class($.clsx(cls('lc-line', resolvedClass)))}${$.attr_style(rest.style, {
					position: 'absolute',
					left: `${$.stringify(item.x1)}px`,
					top: `${$.stringify(item.y1)}px`,
					width: `${$.stringify(length)}px`,
					height: `${$.stringify(resolvedStrokeWidth ?? 1)}px`,
					transform: `translateY(-50%) rotate(${$.stringify(angle)}deg)`,
					'transform-origin': '0 50%',
					opacity: resolvedOpacity,
					background: c.dashArrayResolved
						? dashArrayToGradient(c.dashArrayResolved, resolvedStroke ?? 'var(--stroke-color)')
						: undefined,
					'background-color': c.dashArrayResolved ? undefined : resolvedStroke
				})}></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			const { angle, length } = pointsToAngleAndLength({ x: c.motionX1, y: c.motionY1 }, { x: c.motionX2, y: c.motionY2 });

			$$renderer.push(`<div${$.attr_class($.clsx(cls('lc-line', c.staticClassName)))}${$.attr_style(rest.style, {
				position: 'absolute',
				left: `${$.stringify(c.motionX1)}px`,
				top: `${$.stringify(c.motionY1)}px`,
				width: `${$.stringify(length)}px`,
				height: c.staticHeight,
				transform: `translateY(-50%) rotate(${$.stringify(angle)}deg)`,
				'transform-origin': '0 50%',
				opacity: c.staticOpacity,
				background: c.dashArrayResolved
					? dashArrayToGradient(c.dashArrayResolved, c.staticStroke ?? 'var(--stroke-color)')
					: undefined,
				'background-color': c.dashArrayResolved ? undefined : c.staticStroke
			})}></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}