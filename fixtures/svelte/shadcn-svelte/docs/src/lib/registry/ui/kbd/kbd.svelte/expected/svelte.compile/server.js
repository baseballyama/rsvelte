import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Kbd($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<kbd${$.attributes({
			'data-slot': 'kbd',
			class: $.clsx(cn("cn-kbd pointer-events-none inline-flex items-center justify-center select-none", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></kbd>`);
		$.bind_props($$props, { ref });
	});
}