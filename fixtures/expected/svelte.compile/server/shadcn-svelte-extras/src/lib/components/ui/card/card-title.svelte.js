import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Card_title($$renderer, $$props) {
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
			'data-slot': 'card-title',
			class: $.clsx(cn('text-base leading-normal font-medium group-data-[size=sm]/card:text-sm', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}