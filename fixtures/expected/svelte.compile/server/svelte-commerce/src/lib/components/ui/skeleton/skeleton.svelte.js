import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

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
			class: $.clsx(cn('animate-pulse rounded-md bg-primary/10', className)),
			...restProps
		})}></div>`);

		$.bind_props($$props, { ref });
	});
}