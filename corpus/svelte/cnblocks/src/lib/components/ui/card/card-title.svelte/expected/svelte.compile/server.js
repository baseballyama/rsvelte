import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Card_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			level = 3,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			role: 'heading',
			'aria-level': level,
			class: $.clsx(cn("leading-none font-semibold tracking-tight", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}