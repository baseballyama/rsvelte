import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Field_title($$renderer, $$props) {
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
			'data-slot': 'field-label',
			class: $.clsx(cn("cn-font-heading cn-field-title flex w-fit items-center leading-snug", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}