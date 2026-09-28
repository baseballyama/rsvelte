import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function Frame_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Rect,
			ref: refProp = void 0,
			full = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		const ctx = getChartContext();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Rect) {
				$$renderer.push('<!--[-->');

				Rect($$renderer, $.spread_props([
					{
						x: full && ctx.padding?.left ? -ctx.padding.left : 0,
						y: full && ctx.padding?.top ? -ctx.padding.top : 0,
						width: ctx.width + (full
							? (ctx.padding?.left ?? 0) + (ctx.padding?.right ?? 0)
							: 0),

						height: ctx.height + (full
							? (ctx.padding?.top ?? 0) + (ctx.padding?.bottom ?? 0)
							: 0)
					},
					extractLayerProps(restProps, 'lc-frame'),
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref: refProp });
	});
}