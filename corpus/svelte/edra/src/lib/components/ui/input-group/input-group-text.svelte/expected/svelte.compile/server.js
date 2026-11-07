import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Input_group_text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<span${$.attributes({
			class: $.clsx(cn("flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></span>`);
		$.bind_props($$props, { ref });
	});
}