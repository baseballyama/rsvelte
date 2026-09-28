import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { RectState, rectMarkInfo } from './Rect.shared.svelte.js';

export default function Rect_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, ref: refProp = void 0, $$slots, $$events, ...rest } = $$props;
		let ref = void 0;
		const c = new RectState(() => rest);
		const htmlRest = $.derived(() => rest);

		c.chartCtx.registerComponent({
			name: 'Rect',
			kind: 'mark',
			markInfo: () => rectMarkInfo(rest, c.dataMode)
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

				$$renderer.push(`<div${$.attributes({ ...htmlRest(), class: $.clsx(cls('lc-rect', resolvedClass)) }, void 0, void 0, {
					position: 'absolute',
					left: `${$.stringify(item.x)}px`,
					top: `${$.stringify(item.y)}px`,
					width: `${$.stringify(item.width)}px`,
					height: `${$.stringify(item.height)}px`,
					background: resolvedFill,
					'background-origin': 'border-box',
					opacity: resolvedOpacity,
					'border-width': resolvedBorderWidth,
					'border-style': c.dashArrayResolved ? 'dashed' : 'solid',
					'border-color': resolvedStroke,
					'border-radius': c.borderRadius(item.width, item.height) ?? `${c.rx}px`
				})}></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes(
				{
					...htmlRest(),
					class: $.clsx(cls('lc-rect', c.staticClassName))
				},
				void 0,
				void 0,
				{
					position: 'absolute',
					left: `${$.stringify(c.motionX)}px`,
					top: `${$.stringify(c.motionY)}px`,
					width: `${$.stringify(c.motionWidth)}px`,
					height: `${$.stringify(c.motionHeight)}px`,
					background: c.staticFill,
					'background-origin': 'border-box',
					opacity: c.staticOpacity,
					'border-width': c.staticBorderWidth,
					'border-style': c.dashArrayResolved ? 'dashed' : 'solid',
					'border-color': c.staticStroke,
					'border-radius': c.borderRadiusStyle ?? `${c.rx}px`
				}
			)}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref: refProp });
	});
}