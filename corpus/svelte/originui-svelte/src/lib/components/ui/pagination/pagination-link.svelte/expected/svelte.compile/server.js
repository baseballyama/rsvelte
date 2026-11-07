import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { buttonVariants } from '$lib/components/ui/button.svelte';

export default function Pagination_link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			isActive = false,
			ref = null,
			size = 'icon',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<a${$.attributes({
			'aria-current': isActive ? 'page' : undefined,
			class: $.clsx(cn(buttonVariants({ size, variant: isActive ? 'outline' : 'ghost' }), className)),
			...restProps
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></a>`);
		$.bind_props($$props, { ref });
	});
}