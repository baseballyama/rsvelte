import * as $ from 'svelte/internal/server';
import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Scroll_area_scrollbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			orientation = 'vertical',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ScrollAreaPrimitive.Scrollbar) {
				$$renderer.push('<!--[-->');

				ScrollAreaPrimitive.Scrollbar($$renderer, $.spread_props([
					{
						'data-slot': 'scroll-area-scrollbar',
						'data-orientation': orientation,
						orientation,
						class: cn('flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent', className)
					},
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							children?.($$renderer);
							$$renderer.push(`<!----> `);

							if (ScrollAreaPrimitive.Thumb) {
								$$renderer.push('<!--[-->');

								ScrollAreaPrimitive.Thumb($$renderer, {
									'data-slot': 'scroll-area-thumb',
									class: 'bg-border relative flex-1 rounded-full'
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
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
		$.bind_props($$props, { ref });
	});
}