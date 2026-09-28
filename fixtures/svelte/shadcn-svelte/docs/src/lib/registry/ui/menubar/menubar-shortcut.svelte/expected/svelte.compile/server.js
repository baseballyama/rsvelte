import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Menubar_shortcut($$renderer, $$props) {
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
			'data-slot': 'menubar-shortcut',
			class: $.clsx(cn("cn-menubar-shortcut ml-auto", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></span>`);
		$.bind_props($$props, { ref });
	});
}