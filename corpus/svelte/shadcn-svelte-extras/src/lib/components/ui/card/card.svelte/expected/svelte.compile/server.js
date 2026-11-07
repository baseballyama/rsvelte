import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			size = 'default',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'card',
			'data-size': size,
			class: $.clsx(cn('ring-foreground/10 bg-card text-card-foreground group/card overflow-card flex flex-col gap-6 rounded-xl py-6 text-sm shadow-xs ring-1 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}