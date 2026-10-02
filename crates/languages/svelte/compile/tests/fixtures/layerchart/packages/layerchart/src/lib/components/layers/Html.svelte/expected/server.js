import * as $ from 'svelte/internal/server';
import Facet from '../Facet.svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { setLayerContext } from '$lib/contexts/layer.js';

export default function Html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref: refProp = void 0,
			zIndex = 0,
			pointerEvents = true,
			role,
			'aria-label': label,
			'aria-labelledby': labelledBy,
			'aria-describedby': describedBy,
			center = false,
			ignoreTransform = false,
			clip = false,
			class: className,
			children: childrenProp,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		const roleVal = $.derived(() => role || (label || labelledBy || describedBy ? 'figure' : undefined));
		const ctx = getChartContext();

		const transform = $.derived(() => {
			if (ctx.transform.mode === 'canvas' && !ignoreTransform) {
				return `translate(${ctx.transform.translate.x}px,${ctx.transform.translate.y}px) scale(${ctx.transform.scale})`;
			} else if (center) {
				return `translate(${center === 'x' || center === true ? ctx.width / 2 : 0}px, ${center === 'y' || center === true ? ctx.height / 2 : 0}px)`;
			}
		});

		setLayerContext('html');

		$$renderer.push(`<div${$.attributes(
			{
				class: $.clsx(['lc-layout-html', className]),
				role: roleVal(),
				'aria-label': label,
				'aria-labelledby': labelledBy,
				'aria-describedby': describedBy,
				...restProps
			},
			'svelte-19gkgt0',
			{ disablePointerEvents: pointerEvents === false, clip },
			{
				transform,
				'transform-origin': 'top left',
				'z-index': zIndex,
				top: `${$.stringify(ctx.padding.top)}px`,
				bottom: `${$.stringify(ctx.padding.bottom)}px`,
				left: `${$.stringify(ctx.padding.left)}px`,
				right: `${$.stringify(ctx.padding.right)}px`
			}
		)}>`);

		{
			function children($$renderer, { facet }) {
				childrenProp?.($$renderer, { ref, facet });
				$$renderer.push(`<!---->`);
			}

			Facet($$renderer, { children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref: refProp });
	});
}