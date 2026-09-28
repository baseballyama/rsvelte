import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Field_content($$renderer, $$props) {
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
			'data-slot': 'field-content',
			class: $.clsx(cn("group/field-content flex flex-1 flex-col gap-1.5 leading-snug", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}