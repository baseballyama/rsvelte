import * as $ from 'svelte/internal/server';
import Scrollbar from './scroll-area-scrollbar.svelte';
import { cn } from '$lib/utils.js';
import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';

export default function Scroll_area($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			orientation = 'vertical',
			ref = null,
			scrollbarXClasses = 'h-2.5 flex-col border-t border-t-transparent p-px',
			scrollbarYClasses = 'h-full w-2.5 border-l border-l-transparent p-px',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ScrollAreaPrimitive.Root) {
				$$renderer.push('<!--[-->');

				ScrollAreaPrimitive.Root($$renderer, $.spread_props([
					restProps,
					{
						class: cn('relative overflow-hidden', className),
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (ScrollAreaPrimitive.Viewport) {
								$$renderer.push('<!--[-->');

								ScrollAreaPrimitive.Viewport($$renderer, {
									class: 'h-full w-full  rounded-[inherit]',
									children: ($$renderer) => {
										children?.($$renderer);
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (orientation === 'vertical' || orientation === 'both') {
								$$renderer.push('<!--[0-->');
								Scrollbar($$renderer, { orientation: 'vertical', class: scrollbarYClasses });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (orientation === 'horizontal' || orientation === 'both') {
								$$renderer.push('<!--[0-->');
								Scrollbar($$renderer, { orientation: 'horizontal', class: scrollbarXClasses });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (ScrollAreaPrimitive.Corner) {
								$$renderer.push('<!--[-->');
								ScrollAreaPrimitive.Corner($$renderer, {});
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