import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Avatar_group_count($$renderer, $$props) {
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
			'data-slot': 'avatar-group-count',
			class: $.clsx(cn("cn-avatar-group-count relative flex shrink-0 items-center justify-center ring-2 ring-background", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}