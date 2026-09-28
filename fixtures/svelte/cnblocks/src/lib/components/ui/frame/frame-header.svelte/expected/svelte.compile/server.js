import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Frame_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<header${$.attributes({
			'data-slot': 'frame-panel-header',
			class: $.clsx(cn("flex flex-col px-5 py-4", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></header>`);
		$.bind_props($$props, { ref });
	});
}