import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Empty($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'empty',
			class: $.clsx(cn("cn-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}