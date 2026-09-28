import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Frame($$renderer, $$props) {
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
			'data-slot': 'frame',
			class: $.clsx(cn("relative flex flex-col rounded-2xl bg-muted/72 p-1", "*:[[data-slot=frame-panel]+[data-slot=frame-panel]]:mt-1", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}