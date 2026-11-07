import * as $ from 'svelte/internal/server';
import * as ResizablePrimitive from "paneforge";
import { cn } from "$lib/utils.js";

export default function Resizable_handle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			withHandle = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ResizablePrimitive.PaneResizer) {
				$$renderer.push('<!--[-->');

				ResizablePrimitive.PaneResizer($$renderer, $.spread_props([
					{
						'data-slot': 'resizable-handle',
						class: cn("cn-resizable-handle relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-hidden data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:translate-x-0 data-[direction=vertical]:after:-translate-y-1/2 [&[data-direction=vertical]>div]:rotate-90", className)
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
							if (withHandle) {
								$$renderer.push(`<!--[0--><div class="cn-resizable-handle-icon z-10 flex shrink-0"></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
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