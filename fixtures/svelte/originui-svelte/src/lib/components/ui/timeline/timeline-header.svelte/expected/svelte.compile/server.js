import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

export default function Timeline_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn(className)),
			'data-slot': 'timeline-header',
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}