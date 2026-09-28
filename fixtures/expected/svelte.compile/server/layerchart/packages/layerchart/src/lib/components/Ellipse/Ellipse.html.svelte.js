import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { EllipseState, ellipseMarkInfo } from './Ellipse.shared.svelte.js';

export default function Ellipse_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...rest } = $$props;
		const c = new EllipseState(() => rest);

		c.chartCtx.registerComponent({
			name: 'Ellipse',
			kind: 'mark',
			markInfo: () => ellipseMarkInfo(rest, c.dataMode)
		});

		if (c.dataMode) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.resolvedItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale);
				const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale);
				const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d);
				const resolvedOpacity = resolveStyleProp(rest.opacity, item.d);
				const resolvedClass = resolveStyleProp(rest.class, item.d);

				const resolvedBorderWidth = resolvedStrokeWidth != null
					? `${resolvedStrokeWidth}px`
					: resolvedStroke != null ? '1px' : undefined;

				$$renderer.push(`<div${$.attributes({ ...rest, class: $.clsx(cls('lc-ellipse', resolvedClass)) }, void 0, void 0, {
					position: 'absolute',
					left: `${$.stringify(item.cx)}px`,
					top: `${$.stringify(item.cy)}px`,
					width: `${$.stringify(item.rx * 2)}px`,
					height: `${$.stringify(item.ry * 2)}px`,
					'border-radius': '50%',
					background: resolvedFill,
					'background-origin': 'border-box',
					opacity: resolvedOpacity,
					'border-width': resolvedBorderWidth,
					'border-color': resolvedStroke,
					'border-style': 'solid',
					transform: 'translate(-50%, -50%)'
				})}></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...rest, class: $.clsx(cls('lc-ellipse', c.staticClassName)) }, void 0, void 0, {
				position: 'absolute',
				left: `${$.stringify(c.motionCx)}px`,
				top: `${$.stringify(c.motionCy)}px`,
				width: `${$.stringify(c.motionRx * 2)}px`,
				height: `${$.stringify(c.motionRy * 2)}px`,
				'border-radius': '50%',
				background: c.staticFill,
				'background-origin': 'border-box',
				opacity: c.staticOpacity,
				'border-width': c.staticBorderWidth,
				'border-color': c.staticStroke,
				'border-style': 'solid',
				transform: 'translate(-50%, -50%)'
			})}></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}