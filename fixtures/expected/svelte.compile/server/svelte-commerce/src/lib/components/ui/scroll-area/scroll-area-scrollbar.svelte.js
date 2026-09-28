import * as $ from 'svelte/internal/server';
import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

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
						orientation,
						class: cn('flex touch-none select-none transition-colors', orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-px', orientation === 'horizontal' && 'h-2.5 w-full border-t border-t-transparent p-px', className)
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
									class: cn('relative rounded-full bg-border', orientation === 'vertical' && 'flex-1')
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