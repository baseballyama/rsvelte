import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Field_description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<p${$.attributes({
			'data-slot': 'field-description',
			class: $.clsx(cn("cn-field-description leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance", "last:mt-0 nth-last-2:-mt-1", "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></p>`);
		$.bind_props($$props, { ref });
	});
}