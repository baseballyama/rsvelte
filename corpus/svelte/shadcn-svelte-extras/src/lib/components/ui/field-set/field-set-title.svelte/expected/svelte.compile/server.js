import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Field_set_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			level = 3,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			role: 'heading',
			'aria-level': level,
			class: $.clsx(cn('text-2xl leading-none font-semibold tracking-tight', className)),
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}