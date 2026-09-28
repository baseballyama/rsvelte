import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Frame_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<footer${$.attributes({
			'data-slot': 'frame-panel-footer',
			class: $.clsx(cn("px-5 py-4", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></footer>`);
		$.bind_props($$props, { ref });
	});
}