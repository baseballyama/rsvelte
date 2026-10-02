import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Input_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'input-group',
			role: 'group',
			class: $.clsx(cn("group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto", className)),
			...props
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}