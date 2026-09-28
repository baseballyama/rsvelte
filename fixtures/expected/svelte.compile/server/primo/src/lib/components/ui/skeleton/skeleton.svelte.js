import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.ts';

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
			class: $.clsx(cn('bg-primary/10 animate-pulse rounded-md', className)),
			...restProps
		})}></div>`);

		$.bind_props($$props, { ref });
	});
}