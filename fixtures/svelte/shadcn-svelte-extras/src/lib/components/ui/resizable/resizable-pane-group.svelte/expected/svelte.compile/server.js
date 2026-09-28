import * as $ from 'svelte/internal/server';
import * as ResizablePrimitive from 'paneforge';
import { cn } from '$lib/utils.js';

export default function Resizable_pane_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			this: paneGroup = void 0,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ResizablePrimitive.PaneGroup) {
				$$renderer.push('<!--[-->');

				ResizablePrimitive.PaneGroup($$renderer, $.spread_props([
					{
						'data-slot': 'resizable-pane-group',
						class: cn('cn-resizable-panel-group flex h-full w-full data-[direction=vertical]:flex-col', className)
					},
					restProps,
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
		$.bind_props($$props, { ref, this: paneGroup });
	});
}