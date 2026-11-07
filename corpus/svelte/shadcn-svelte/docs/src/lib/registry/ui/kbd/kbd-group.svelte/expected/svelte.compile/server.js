import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Kbd_group($$renderer, $$props) {
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
			'data-slot': 'kbd-group',
			class: $.clsx(cn("cn-kbd-group inline-flex items-center", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></kbd>`);
		$.bind_props($$props, { ref });
	});
}