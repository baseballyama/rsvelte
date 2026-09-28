import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Calendar_month($$renderer, $$props) {
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
			...restProps,
			class: $.clsx(cn("flex w-full flex-col gap-4", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}