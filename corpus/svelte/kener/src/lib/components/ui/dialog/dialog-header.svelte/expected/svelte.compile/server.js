import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Dialog_header($$renderer, $$props) {
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
			'data-slot': 'dialog-header',
			class: $.clsx(cn("flex flex-col gap-2 text-center sm:text-start", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}