import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Breadcrumb_page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<span${$.attributes({
			'data-slot': 'breadcrumb-page',
			role: 'link',
			'aria-disabled': 'true',
			'aria-current': 'page',
			class: $.clsx(cn("cn-breadcrumb-page", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></span>`);
		$.bind_props($$props, { ref });
	});
}