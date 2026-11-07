import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Pagination($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<nav${$.attributes({
			'aria-label': 'pagination',
			class: $.clsx(cn('mx-auto flex w-full justify-center', className)),
			...restProps
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></nav>`);
		$.bind_props($$props, { ref });
	});
}