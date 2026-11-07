import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Card_description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<p${$.attributes({
			'data-slot': 'card-description',
			class: $.clsx(cn('text-muted-foreground text-sm', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></p>`);
		$.bind_props($$props, { ref });
	});
}