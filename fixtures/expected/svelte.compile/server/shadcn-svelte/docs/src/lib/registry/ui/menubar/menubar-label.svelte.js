import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Menubar_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			inset,
			children,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'menubar-label',
			'data-inset': inset,
			class: $.clsx(cn("cn-menubar-label", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}