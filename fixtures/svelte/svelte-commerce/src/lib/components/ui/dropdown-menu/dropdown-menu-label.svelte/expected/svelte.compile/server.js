import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Dropdown_menu_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			inset,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}