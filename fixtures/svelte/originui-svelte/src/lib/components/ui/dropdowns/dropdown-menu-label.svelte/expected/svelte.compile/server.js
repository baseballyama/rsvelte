import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Dropdown_menu_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			inset,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('text-muted-foreground px-2 py-1.5 text-xs font-medium', inset && 'pl-8', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}