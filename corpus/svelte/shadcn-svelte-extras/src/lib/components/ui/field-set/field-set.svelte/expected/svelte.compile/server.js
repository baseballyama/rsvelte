import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { fieldSetVariants } from '.';

export default function Field_set($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			variant = 'default',
			children,
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn(fieldSetVariants({ variant }), className)),
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}