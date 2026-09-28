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
			class: $.clsx(cn("cn-field-content group/field-content flex flex-1 flex-col leading-snug", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}