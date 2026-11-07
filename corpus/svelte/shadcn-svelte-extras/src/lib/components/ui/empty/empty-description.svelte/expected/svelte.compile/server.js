import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Empty_description($$renderer, $$props) {
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
			'data-slot': 'empty-description',
			class: $.clsx(cn('text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}