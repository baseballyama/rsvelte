import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Skeleton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'skeleton',
			class: $.clsx(cn("animate-pulse rounded-md bg-accent", className)),
			...restProps
		})}></div>`);

		$.bind_props($$props, { ref });
	});
}