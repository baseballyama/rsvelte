import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Input_group_text($$renderer, $$props) {
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
			class: $.clsx(cn("cn-input-group-text flex items-center [&_svg]:pointer-events-none", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></span>`);
		$.bind_props($$props, { ref });
	});
}