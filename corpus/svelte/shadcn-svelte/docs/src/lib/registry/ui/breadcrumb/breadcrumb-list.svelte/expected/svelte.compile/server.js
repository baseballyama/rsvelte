import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Breadcrumb_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<ol${$.attributes({
			'data-slot': 'breadcrumb-list',
			class: $.clsx(cn("cn-breadcrumb-list flex flex-wrap items-center wrap-break-word", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ol>`);
		$.bind_props($$props, { ref });
	});
}